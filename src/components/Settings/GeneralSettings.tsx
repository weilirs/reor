import { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch'
import { XStack, YStack, SizableText, Separator } from 'tamagui'

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
      width="100%"
      overflow="hidden"
    >
      <XStack className="h-[2px] w-full bg-neutral-700" />
      <XStack>
        <XStack 
        justifyContent="space-between"
        alignItems="center"
        py="$3"
        width="100%">
          <YStack width="60%">
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
          <Switch
            checked={editorFlexCenter}
            onChange={() => {
              setEditorFlexCenter(!editorFlexCenter)
              if (editorFlexCenter !== undefined) {
                window.electronStore.setEditorFlexCenter(!editorFlexCenter)
              }
            }}
          />
        </XStack>
      </XStack>

      <div className="h-[2px] w-full bg-neutral-700" />

      <XStack >
        <XStack 
        justifyContent="space-between"
        alignItems="center"
        py="$3"
        width="100%">
          <YStack width="60%">
            <SizableText
              size="$3"
              fontWeight="semi-bold"
            >
              Spell Check
            </SizableText>
            <SizableText
              size="$1"
              py="$2"
            >
              Note: Quit and restart the app for this to take effect
            </SizableText>
          </YStack>
          <Switch
            checked={tempSpellCheckEnabled}
            onChange={() => {
              handleSaveSpellCheck(!tempSpellCheckEnabled)
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </XStack>
      </XStack>

      <div className="h-[2px] w-full bg-neutral-700" />

      <XStack >
        <XStack 
        justifyContent="space-between"
        alignItems="center"
        py="$3"
        width="100%">
          <YStack width="60%">
            <SizableText
              size="$3"
              fontWeight="semi-bold"
            >
              Document Statistics
            </SizableText>
            <SizableText
              size="$1"
              py="$2"
            >
              Display real-time word and character statistics while editing your document
            </SizableText>
          </YStack>
          <Switch
            checked={documentStatsEnabled}
            onChange={() => {
              handleSaveDocStats(!documentStatsEnabled)
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </XStack>
      </XStack>
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
      <EditorSection />
    </YStack>
  )
}

export default GeneralSettings
