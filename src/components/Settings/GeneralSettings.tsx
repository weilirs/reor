import { useEffect, useState } from 'react'
// import Switch from '@mui/material/Switch'
import { XStack, YStack, SizableText, Switch } from 'tamagui'

export const EditorSection = () => {
  const [tempSpellCheckEnabled, setTempSpellCheckEnabled] = useState(false)
  const [documentStatsEnabled, setDocumentStatsEnabled] = useState(false)
  const [editorFlexCenter, setEditorFlexCenter] = useState<boolean>(true)

  useEffect(() => {
    const fetchParams = async () => {
      const isSpellCheckEnabled = await window.electronStore.getSpellCheckMode()
      const isDocumentStatsCheckEnabled = await window.electronStore.getDocumentStats()

      if (isSpellCheckEnabled !== undefined) {
        setTempSpellCheckEnabled(isSpellCheckEnabled)
      }
      if (isDocumentStatsCheckEnabled !== undefined) {
        setDocumentStatsEnabled(isDocumentStatsCheckEnabled)
      }
    }

    fetchParams()
  }, [])

  const handleSaveSpellCheck = (setChecked: boolean) => {
    // Execute the save function here
    window.electronStore.setSpellCheckMode(setChecked)
    setTempSpellCheckEnabled(!tempSpellCheckEnabled)
  }
  const handleSaveDocStats = async (setChecked: boolean) => {
    // Execute the save function here
    await window.electronStore.setDocumentStats(setChecked)
    setDocumentStatsEnabled(!documentStatsEnabled)
  }

  // Check if we should have flex center for our editor
  useEffect(() => {
    const fetchParams = async () => {
      const getEditorFlexCenter = await window.electronStore.getEditorFlexCenter()

      if (getEditorFlexCenter !== undefined) {
        setEditorFlexCenter(getEditorFlexCenter)
      }
    }

    fetchParams()
  }, [])

  return (
    <YStack 
      className="flex-col pt-4"
      maxWidth="100%"
      overflow="hidden"
    >
      <XStack className="h-[2px] w-full bg-neutral-700" />
      <XStack >
        <YStack py="$3">
          <YStack width="40%">
            <SizableText
              size="$3"
              fontWeight="semi-bold"
            >
              Content Flex Center
            </SizableText>
            <SizableText
              size="$1"
              py="$2"
            >
              Centers content inside editor. Recommended for larger screens
            </SizableText>
          </YStack>
        </YStack>
        <Switch
          color="$gray12"
          checked={editorFlexCenter}
          onChange={() => {
            setEditorFlexCenter(!editorFlexCenter)
            if (editorFlexCenter !== undefined) {
              window.electronStore.setEditorFlexCenter(!editorFlexCenter)
            }
          }}
        />
      </XStack>
      <div className="h-[2px] w-full bg-neutral-700" />
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex w-[70%] flex-col justify-center">
          <p className="xs:text-xs flex flex-col text-base text-gray-100 opacity-80 sm:text-sm">
            Spell Check
            <span className="m-0 pt-1 text-xs text-gray-100">
              Note: Quit and restart the app for this to take effect
            </span>
          </p>
        </div>
        <Switch
          checked={tempSpellCheckEnabled}
          onChange={() => {
            handleSaveSpellCheck(!tempSpellCheckEnabled)
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </div>
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex w-[70%] flex-col justify-center">
          <p className="xs:text-xs flex flex-col text-base text-gray-100 opacity-80 sm:text-sm">
            Document Statistics
            <span className="m-0 pt-1 text-xs text-gray-100">
              Display real-time word and character statistics while editing your document
            </span>
          </p>
        </div>
        <Switch
          checked={documentStatsEnabled}
          onChange={() => {
            handleSaveDocStats(!documentStatsEnabled)
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </div>
    </YStack>
  )
}

const GeneralSettings = () => {
  return (
    <YStack 
      px="$4"
      backgroundColor="$gray1"
      color="$gray13"
      maxWidth="100%">
      <h2 className="mb-0 text-2xl font-semibold">Editor</h2>
      {/* <EditorSection /> */}
    </YStack>
  )
}

export default GeneralSettings
