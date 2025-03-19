import React, { ReactNode } from 'react'
import { Menu, MenuProps } from '@mantine/core'
import { PolymorphicComponentProps } from '@mantine/utils'
import { useTheme } from 'tamagui'
import { MenuLabelProps } from '@mantine/core'

interface ThemedMenuProps {
  children: ReactNode,
}

type ThemedMenuItemProps<C = "button"> = PolymorphicComponentProps<
  C,
  React.ComponentProps<typeof Menu.Item>
>;

const ThemedMenu: React.FC<ThemedMenuProps & MenuProps> = ({ children, ...restProps }) => {
  const theme = useTheme()

  return (
    <Menu {...restProps} styles={{ dropdown: { backgroundColor: theme.background.val } }}>
      {children}
    </Menu>
  )
}

export const ThemedMenuItem = <C extends React.ElementType = "button">({style, ...props}: ThemedMenuItemProps<C>) => {
  const theme = useTheme();

  return (
    <Menu.Item
      {...props}
      style={{
        backgroundColor: theme.background.val,
        color: theme.color.val,
        ...style,
      }}
      onMouseEnter={(e: any) => {
        // TODO: Temporary fix for hover background color. Original is too light.
        e.currentTarget.style.backgroundColor = theme.background.val === '#f9f9f9' ? 'hsl(0, 0%, 93.3%)' : theme.backgroundHover.val;
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.backgroundColor = theme.background.val;
      }}
    />
  );
};

export const ThemedLabel: React.FC<ThemedMenuProps & MenuLabelProps> = ({children, ...restProps}) => {
  const theme = useTheme()

  return (
    <Menu.Label 
      {...restProps}
      style={{
        backgroundColor: theme.background.val,
        color: theme.color.val,
      }}
    >{children}</Menu.Label>
  )
}


export default ThemedMenu

