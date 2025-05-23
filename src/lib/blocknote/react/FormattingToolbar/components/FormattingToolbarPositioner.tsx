import Tippy from '@tippyjs/react'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { sticky } from 'tippy.js'
import { BlockSchema, DefaultBlockSchema, BlockNoteEditor } from '@/lib/blocknote/core'

import DefaultFormattingToolbar from './DefaultFormattingToolbar'

export type FormattingToolbarProps<BSchema extends BlockSchema = DefaultBlockSchema> = {
  editor: BlockNoteEditor<BSchema>
}

// We want Tippy to call `getReferenceClientRect` whenever the reference
// DOMRect's position changes. This happens automatically on scroll, but we need
// the `sticky` plugin to make it happen in all cases. This is most evident
// when changing the text alignment using the formatting toolbar.
const tippyPlugins = [sticky]

export const FormattingToolbarPositioner = <BSchema extends BlockSchema = DefaultBlockSchema>(props: {
  editor: BlockNoteEditor<BSchema>
  formattingToolbar?: FC<FormattingToolbarProps<BSchema>>
}) => {
  const [show, setShow] = useState<boolean>(false)

  const referencePos = useRef<DOMRect>()

  useEffect(() => {
    return props.editor.formattingToolbar.onUpdate((state) => {
      setShow(state.show)

      referencePos.current = state.referencePos
    })
  }, [props.editor])

  const getReferenceClientRect = useMemo(
    () => {
      if (!referencePos) {
        return undefined
      }
      return () => referencePos.current!
    },
    [referencePos.current], // eslint-disable-line
  )

  const formattingToolbarElement = useMemo(() => {
    const FormattingToolbar = props.formattingToolbar || DefaultFormattingToolbar

    return <FormattingToolbar editor={props.editor} />
  }, [props.editor, props.formattingToolbar])

  return (
    <Tippy
      appendTo={props.editor.domElement.parentElement ?? document.body}
      content={formattingToolbarElement}
      getReferenceClientRect={getReferenceClientRect}
      interactive
      visible={show}
      animation="fade"
      placement="top-start"
      sticky
      plugins={tippyPlugins}
    />
  )
}
