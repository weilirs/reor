import React from 'react'
import { Button } from '@/components/ui/button'
import { YStack, XStack, SizableText } from 'tamagui'

const SettingsRow: React.FC<{
  title: string
  description?: string
  buttonText?: string
  onClick?: () => void
  children?: React.ReactNode
}> = ({ title, description, buttonText, onClick, children }) => (
    <XStack py="$3" width="100%">
      <YStack width="55%">
        <SizableText size="$3" fontWeight='semi-bold'>{title}</SizableText>
        <SizableText>{description && <span className="block pt-1 text-xs">{description}</span>}</SizableText>
      </YStack>

        {buttonText && (
          <Button variant="secondary" onClick={onClick}>
            {buttonText}
          </Button>
        )}
        {children}
    </XStack>
)

export default SettingsRow
