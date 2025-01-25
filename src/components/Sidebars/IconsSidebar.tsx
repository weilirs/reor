import React from 'react'

import { GrNewWindow } from 'react-icons/gr'
import { MdSettings } from 'react-icons/md'
import { VscNewFolder } from 'react-icons/vsc'
import { HiOutlinePencilAlt } from 'react-icons/hi'

import { useModalOpeners } from '../../contexts/ModalContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'
import { useThemeManager } from '@/contexts/ThemeContext'

import { Files, MessageCircle, Search, Moon, SunMoon } from '@tamagui/lucide-icons'
import { Button, YStack } from 'tamagui'

export interface IconsSidebarProps {
  getShortcutDescription: (action: string) => string
}

const IconsSidebar: React.FC<IconsSidebarProps> = ({ getShortcutDescription }) => {
  const { sidebarShowing, setSidebarShowing } = useChatContext()
  const { state, actions } = useThemeManager() // State => theme, actions => toggle, set, syncWithSystem

  console.log(`State is: ${state}`)
  const { isSettingsModalOpen, setIsSettingsModalOpen, setIsNewDirectoryModalOpen } = useModalOpeners()
  const { createUntitledNote } = useContentContext()

  const determineColor = (sidebarName: string) => {
    return sidebarShowing === sidebarName ? '$gray12' : '$gray11'
  }

  return (
    <YStack 
      backgroundColor="$gray3"
      className="flex size-full w-[55px] flex-col items-center justify-between gap-1 bg-neutral-800 pt-2"
    >
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('files')}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <Files 
            size={20} 
            color={determineColor('files')}
            title={getShortcutDescription('open-files') || 'Files'}
          />
        </div>
      </div>
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('chats')}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <MessageCircle 
            size={20}
            color={determineColor('chats')}  
            title={getShortcutDescription('open-chat-bot') || 'Open Chatbot'}
          />
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('search')}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <Search 
            size={20}
            color={determineColor('search')}
            title={getShortcutDescription('open-search') || 'Semantic Search'}
          />
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => createUntitledNote()}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <HiOutlinePencilAlt
            className="text-gray-200"
            color="gray"
            size={22}
            title={getShortcutDescription('open-new-note') || 'New Note'}
          />
        </div>
      </div>
      <div
        className="mt-[2px] flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <VscNewFolder
            className="text-gray-200"
            color="gray"
            size={18}
            title={getShortcutDescription('open-new-directory-modal') || 'New Directory'}
          />
        </div>
      </div>

      <div className="grow border-yellow-300" />
      <button
        className="flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-3"
        onClick={() => console.log(`Selected change theme`)}
        type="button"
        aria-label="Change Theme"
      >
        <Button onPress={actions.toggle} backgroundColor="transparent">
          {state === 'light' ? <Moon size={18} /> : <SunMoon size={18} />}
        </Button>
      </button>
      <div
        className="mb-[2px] flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => window.electronUtils.openNewWindow()}
      >
        <GrNewWindow className="text-gray-100" color="gray" size={18} title="Open New Vault" />
      </div>
      <button
        className="flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
        type="button"
        aria-label="Open Settings"
      >
        <MdSettings
          color="gray"
          size={18}
          className="mb-3 size-6 text-gray-100"
          title={getShortcutDescription('open-settings-modal') || 'Settings'}
        />
      </button>
    </YStack>
  )
}

export default IconsSidebar
