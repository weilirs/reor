import {config} from './src/components/ui/tamagui/tamagui.config'

type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}

  interface TypeOverride {
    groupNames(): 'header' | 'item' | 'blocknode' | 'pathitem' | 'icon'
  }
}

export default config
