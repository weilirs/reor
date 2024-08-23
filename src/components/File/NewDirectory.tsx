import React, { useEffect, useState } from 'react'

import { Button } from '@material-tailwind/react'
import posthog from 'posthog-js'

import ReorModal from '../Common/Modal'
import { getInvalidCharacterInFileName } from '@/utils/strings'

interface NewDirectoryComponentProps {
  isOpen: boolean
  onClose: () => void
  currentOpenFilePath: string | null
}

const NewDirectoryComponent: React.FC<NewDirectoryComponentProps> = ({ isOpen, onClose, currentOpenFilePath }) => {
  const [directoryName, setDirectoryName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setDirectoryName('')
      setErrorMessage(null)
    }
  }, [isOpen])

  const handleValidName = async (name: string) => {
    const invalidCharacters = await getInvalidCharacterInFileName(name)
    if (invalidCharacters) {
      setErrorMessage(`Cannot put ${invalidCharacters} in file name`)
      throw new Error(`Cannot put ${invalidCharacters} in file name`)
    }
    setErrorMessage(null)
  }

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newName = e.target.value
      await handleValidName(newName)
      setDirectoryName(newName)
    } catch (error) {
      throw new Error('Caught error when renaming directory')
    }
  }

  const sendNewDirectoryMsg = async () => {
    try {
      await handleValidName(directoryName)
      if (!directoryName || errorMessage || currentOpenFilePath === null) return

      const directoryPath =
        currentOpenFilePath === ''
          ? await window.electronStore.getVaultDirectoryForWindow()
          : await window.path.dirname(currentOpenFilePath)
      const finalPath = await window.path.join(directoryPath, directoryName)
      window.fileSystem.createDirectory(finalPath)
      posthog.capture('created_new_directory_from_new_directory_modal')
      onClose()
    } catch (e) {
      throw new Error('Caught error in when creating directory')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendNewDirectoryMsg()
    }
  }

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="my-2 ml-3 mr-6 h-full min-w-[400px]">
        <h2 className="mb-3 text-xl font-semibold text-white">New Directory</h2>
        <input
          type="text"
          className=" block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={directoryName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="Directory Name"
        />

        <div className="flex items-center gap-3">
          <Button
            className="mb-2 mt-3 h-10 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={sendNewDirectoryMsg}
            placeholder=""
          >
            Create
          </Button>
          {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
        </div>
      </div>
    </ReorModal>
  )
}

export default NewDirectoryComponent
