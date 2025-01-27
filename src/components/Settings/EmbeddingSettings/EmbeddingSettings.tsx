import React, { useState, useEffect } from 'react'

import { EmbeddingModelConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import ChunkSizeSettings from '../ChunkSizeSettings'
import EmbeddingModelSelect from './EmbeddingModelSelect'
import NewRemoteEmbeddingModelModal from './modals/NewRemoteEmbeddingModel'
import { Button } from '@/components/ui/button'
import { YStack, XStack, SizableText } from 'tamagui'

interface EmbeddingModelManagerProps {
  handleUserHasChangedModel?: () => void
  userTriedToSubmit?: boolean
}

const EmbeddingModelSettings: React.FC<EmbeddingModelManagerProps> = ({
  handleUserHasChangedModel,
  userTriedToSubmit,
}) => {
  const [currentError, setCurrentError] = useState<string>('')
  const [isConextLengthModalOpen, setIsContextLengthModalOpen] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [embeddingModels, setEmbeddingModels] = useState<Record<string, EmbeddingModelConfig>>({})

  const updateEmbeddingModels = async () => {
    const storedEmbeddingModels = await window.electronStore.getEmbeddingModels()

    if (storedEmbeddingModels) {
      setEmbeddingModels(storedEmbeddingModels)
    }

    const defaultModel = await window.electronStore.getDefaultEmbeddingModel()

    if (defaultModel) {
      setSelectedModel(defaultModel)
    }
  }

  useEffect(() => {
    updateEmbeddingModels()
  }, [])

  useEffect(() => {
    if (selectedModel) {
      setCurrentError('')
    } else {
      setCurrentError('No model selected')
    }
  }, [selectedModel])

  const handleChangeOnModelSelect = (newSelectedModel: string) => {
    setSelectedModel(newSelectedModel)
    window.electronStore.setDefaultEmbeddingModel(newSelectedModel)
    posthog.capture('change_default_embedding_model', {
      defaultEmbeddingModel: newSelectedModel,
    })
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel()
    }
  }

  return (
    <YStack 
      px="$4"
      backgroundColor="$gray1"
      maxWidth="100%"
      color="$gray13">

      <h2 className="mb-0">Embedding Model</h2>{' '}

      <YStack
        pt="$4"
        maxWidth="100%"
        width="100%"
        overflow="hidden"
      >
        <XStack className="h-[2px] w-full bg-neutral-700" />

        <XStack 
        justifyContent="space-between"
        alignItems="center"
        py="$3"
        width="100%">
          <YStack width="40%">
            <SizableText
              size="$3"
              fontWeight="semi-bold"
            >
              Select Model
            </SizableText>
            <SizableText
              size="$1"
              py="$2"
            >
              If you change this your files will be re-indexed
            </SizableText>
          </YStack>
          <div className="flex w-[150px] items-end">
            {Object.keys(embeddingModels).length > 0 && (
              <EmbeddingModelSelect
                selectedModel={selectedModel}
                embeddingModels={embeddingModels}
                onModelChange={handleChangeOnModelSelect}
              />
            )}
          </div>
        </XStack>

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
                Custom Embedding Model
              </SizableText>
              <SizableText
                size="$1"
                py="$2"
              >
                Reor will download a HuggingFace embedding model for you.
              </SizableText>
            </YStack>
            <Button variant="secondary" onClick={() => setIsContextLengthModalOpen(true)}>
              Attach
            </Button>
          </XStack>
        </XStack>

        <XStack className="h-[2px] w-full bg-neutral-700" />

        <ChunkSizeSettings>
          <div className="flex-col">
            <SizableText size="$3">Change Chunk Size</SizableText>
            <p className="text-xs text-gray-100 opacity-50">
              A larger chunk size means more context is fed to the model at the cost of &quot;needle in a haystack&quot;
              effects.
            </p>
          </div>
        </ChunkSizeSettings>
      </YStack>
      {/* Warning message at the bottom */}
      <p className="text-xs text-gray-100 opacity-50">
        <i>
          Note: If you notice some lag in the editor it is likely because you chose too large of an embedding model...
        </i>
      </p>{' '}
      <NewRemoteEmbeddingModelModal
        isOpen={isConextLengthModalOpen}
        onClose={() => {
          setIsContextLengthModalOpen(false)
        }}
        handleUserHasChangedModel={() => {
          updateEmbeddingModels()
          if (handleUserHasChangedModel) {
            handleUserHasChangedModel()
          }
        }}
      />
      {userTriedToSubmit && !selectedModel && <p className="mt-1 text-sm text-red-500">{currentError}</p>}
    </YStack>
  )
}

export default EmbeddingModelSettings
