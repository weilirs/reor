import { Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import React from 'react'

const ImageComponent = ({ node }: { node: any }) => {
  return (
    <NodeViewWrapper as="div" className="image-node">
      <img
        src={node.attrs.src}
        alt={node.attrs.alt}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '1em 0',
        }}
      />
    </NodeViewWrapper>
  )
}

export const ImageExtension = Node.create({
  name: 'image',

  group: 'block',

  inline: false,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent)
  },
})

export default ImageExtension
