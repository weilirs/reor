/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { useEffect, useRef, useState } from 'react'

import { MathExtension } from '@aarkue/tiptap-math-extension'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { Editor, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { toast } from 'react-toastify'
import { Markdown } from 'tiptap-markdown'
import { useDebounce } from 'use-debounce'

import { BacklinkExtension } from '@/components/Editor/BacklinkExtension'
import { SuggestionsState } from '@/components/Editor/BacklinkSuggestionsDisplay'
import HighlightExtension, { HighlightData } from '@/components/Editor/HighlightExtension'
import { RichTextLink } from '@/components/Editor/RichTextLink'
import SearchAndReplace from '@/components/Editor/SearchAndReplace'
import { getInvalidCharacterInFilePath, removeFileExtension } from '@/utils/strings'
import 'katex/dist/katex.min.css'
import '../tiptap.scss'
import welcomeNote from '../utils'

const useFileByFilepath = () => {
  const [currentlyOpenedFilePath, setCurrentlyOpenedFilePath] = useState<string | null>(null)
  const [suggestionsState, setSuggestionsState] = useState<SuggestionsState | null>()
  const [needToWriteEditorContentToDisk, setNeedToWriteEditorContentToDisk] = useState<boolean>(false)
  const [needToIndexEditorContent, setNeedToIndexEditorContent] = useState<boolean>(false)
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<string>('false')

  useEffect(() => {
    const fetchSpellCheckMode = async () => {
      const storedSpellCheckEnabled = await window.electronStore.getSpellCheckMode()
      setSpellCheckEnabled(storedSpellCheckEnabled)
    }
    fetchSpellCheckMode()
  }, [spellCheckEnabled])

  const [noteToBeRenamed, setNoteToBeRenamed] = useState<string>('')
  const [fileDirToBeRenamed, setFileDirToBeRenamed] = useState<string>('')
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [currentlyChangingFilePath, setCurrentlyChangingFilePath] = useState(false)
  const [highlightData, setHighlightData] = useState<HighlightData>({
    text: '',
    position: null,
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [displayMarkdown, setDisplayMarkdown] = useState<boolean>(false)

  const setFileNodeToBeRenamed = async (filePath: string) => {
    const isDirectory = await window.fileSystem.isDirectory(filePath)
    if (isDirectory) {
      setFileDirToBeRenamed(filePath)
    } else {
      setNoteToBeRenamed(filePath)
    }
  }

  /**
   * with this editor, we want to take the HTML on the following scenarios:
    1. when the file path changes, causing a re-render
    2. When the component unmounts
    3. when the file is deleted
   */

  const openFileByPath = async (newFilePath: string) => {
    setCurrentlyChangingFilePath(true)
    await writeEditorContentToDisk(editor, currentlyOpenedFilePath)
    if (currentlyOpenedFilePath && needToIndexEditorContent) {
      window.fileSystem.indexFileInDatabase(currentlyOpenedFilePath)
      setNeedToIndexEditorContent(false)
    }
    const newFileContent = (await window.fileSystem.readFile(newFilePath)) ?? ''
    editor?.commands.setContent(newFileContent)
    setCurrentlyOpenedFilePath(newFilePath)
    setCurrentlyChangingFilePath(false)
  }

  const openRelativePath = async (relativePath: string, optionalContentToWriteOnCreate?: string): Promise<void> => {
    const invalidChars = await getInvalidCharacterInFilePath(relativePath)
    if (invalidChars) {
      toast.error(`Could not create note ${relativePath}. Character ${invalidChars} cannot be included in note name.`)
      throw new Error(
        `Could not create note ${relativePath}. Character ${invalidChars} cannot be included in note name.`,
      )
    }
    const relativePathWithExtension = await window.path.addExtensionIfNoExtensionPresent(relativePath)
    const absolutePath = await window.path.join(
      await window.electronStore.getVaultDirectoryForWindow(),
      relativePathWithExtension,
    )
    const fileExists = await window.fileSystem.checkFileExists(absolutePath)
    if (!fileExists) {
      const basename = await window.path.basename(absolutePath)
      const content = optionalContentToWriteOnCreate || `## ${removeFileExtension(basename)}\n`
      await window.fileSystem.createFile(absolutePath, content)
      setNeedToIndexEditorContent(true)
    }
    openFileByPath(absolutePath)
  }

  const openRelativePathRef = useRef<(newFilePath: string) => Promise<void>>()
  openRelativePathRef.current = openRelativePath

  const handleSuggestionsStateWithEventCapture = (suggState: SuggestionsState | null): void => {
    setSuggestionsState(suggState)
  }

  // Check if we should display markdown or not
  useEffect(() => {
    const handleInitialStartup = async () => {
      const isMarkdownSet = await window.electronStore.getDisplayMarkdown()
      setDisplayMarkdown(isMarkdownSet)
    }

    // Even listener
    const handleChangeMarkdown = (isMarkdownSet: boolean) => {
      setDisplayMarkdown(isMarkdownSet)
    }

    handleInitialStartup()
    window.ipcRenderer.receive('display-markdown-changed', handleChangeMarkdown)
  }, [])

  const editor = useEditor({
    autofocus: true,

    onUpdate() {
      setNeedToWriteEditorContentToDisk(true)
      setNeedToIndexEditorContent(true)
    },
    editorProps: {},
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      TaskList,
      MathExtension.configure({
        evaluation: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      SearchAndReplace.configure({
        searchResultClass: 'bg-yellow-400',
        disableRegex: false,
      }),
      Markdown.configure({
        html: true, // Allow HTML input/output
        tightLists: true, // No <p> inside <li> in markdown output
        tightListClass: 'tight', // Add class to <ul> allowing you to remove <p> margins when tight
        bulletListMarker: '-', // <li> prefix in markdown output
        linkify: true, // Create links from "https://..." text
        breaks: true, // New lines (\n) in markdown input are converted to <br>
        transformPastedText: true, // Allow to paste markdown text in the editor
        transformCopiedText: true, // Copied text is transformed to markdown
      }),
      TaskItem.configure({
        nested: true,
      }),
      HighlightExtension(setHighlightData),
      RichTextLink.configure({
        linkOnPaste: true,
        openOnClick: true,
      }),
      BacklinkExtension(openRelativePathRef, handleSuggestionsStateWithEventCapture),
    ],
  })

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            spellcheck: spellCheckEnabled,
          },
        },
      })
    }
  }, [spellCheckEnabled, editor])

  const [debouncedEditor] = useDebounce(editor?.state.doc.content, 4000)

  useEffect(() => {
    if (debouncedEditor && !currentlyChangingFilePath) {
      writeEditorContentToDisk(editor, currentlyOpenedFilePath)
    }
  }, [debouncedEditor, currentlyOpenedFilePath, editor, currentlyChangingFilePath])

  const saveCurrentlyOpenedFile = async () => {
    await writeEditorContentToDisk(editor, currentlyOpenedFilePath)
  }

  const writeEditorContentToDisk = async (_editor: Editor | null, filePath: string | null) => {
    if (filePath !== null && needToWriteEditorContentToDisk && _editor) {
      const markdownContent = getMarkdown(_editor)
      if (markdownContent !== null) {
        await window.fileSystem.writeFile({
          filePath,
          content: markdownContent,
        })

        setNeedToWriteEditorContentToDisk(false)
      }
    }
  }

  // delete file depending on file path returned by the listener
  useEffect(() => {
    const deleteFile = async (path: string) => {
      await window.fileSystem.deleteFile(path)

      // if it is the current file, clear the content and set filepath to null so that it won't save anything else
      if (currentlyOpenedFilePath === path) {
        editor?.commands.setContent('')
        setCurrentlyOpenedFilePath(null)
      }
    }

    const removeDeleteFileListener = window.ipcRenderer.receive('delete-file-listener', deleteFile)

    return () => {
      removeDeleteFileListener()
    }
  }, [currentlyOpenedFilePath, editor])

  useEffect(() => {
    async function checkAppUsage() {
      if (!editor || currentlyOpenedFilePath) return
      const hasOpened = await window.electronStore.getHasUserOpenedAppBefore()

      if (!hasOpened) {
        await window.electronStore.setHasUserOpenedAppBefore()
        openRelativePath('Welcome to Reor', welcomeNote)
      }
    }

    checkAppUsage()
  }, [editor, currentlyOpenedFilePath])

  const renameFileNode = async (oldFilePath: string, newFilePath: string) => {
    await window.fileSystem.renameFileRecursive({
      oldFilePath,
      newFilePath,
    })
    // set the file history array to use the new absolute file path if there is anything matching
    const navigationHistoryUpdated = [...navigationHistory].map((path) => path.replace(oldFilePath, newFilePath))

    setNavigationHistory(navigationHistoryUpdated)

    // reset the editor to the new file path
    if (currentlyOpenedFilePath === oldFilePath) {
      setCurrentlyOpenedFilePath(newFilePath)
    }
  }

  // open a new file rename dialog
  useEffect(() => {
    const renameFileListener = window.ipcRenderer.receive('rename-file-listener', (noteName: string) =>
      setFileNodeToBeRenamed(noteName),
    )

    return () => {
      renameFileListener()
    }
  }, [])

  useEffect(() => {
    const handleWindowClose = async () => {
      if (currentlyOpenedFilePath !== null && editor && editor.getHTML() !== null) {
        const markdown = getMarkdown(editor)
        await window.fileSystem.writeFile({
          filePath: currentlyOpenedFilePath,
          content: markdown,
        })
        await window.fileSystem.indexFileInDatabase(currentlyOpenedFilePath)
      }
    }

    const removeWindowCloseListener = window.ipcRenderer.receive('prepare-for-window-close', handleWindowClose)

    return () => {
      removeWindowCloseListener()
    }
  }, [currentlyOpenedFilePath, editor])

  return {
    filePath: currentlyOpenedFilePath,
    saveCurrentlyOpenedFile,
    editor,
    navigationHistory,
    setNavigationHistory,
    openFileByPath,
    openRelativePath,
    suggestionsState,
    spellCheckEnabled,
    highlightData,
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile: renameFileNode,
    setSuggestionsState,
    setSpellCheckEnabled,
  }
}

function getMarkdown(editor: Editor) {
  // Fetch the current markdown content from the editor
  const originalMarkdown = editor.storage.markdown.getMarkdown()
  // Replace the escaped square brackets with unescaped ones
  const modifiedMarkdown = originalMarkdown
    .replace(/\\\[/g, '[') // Replaces \[ with [
    .replace(/\\\]/g, ']') // Replaces \] wi ]

  return modifiedMarkdown
}

export default useFileByFilepath
