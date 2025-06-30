/* eslint-disable @typescript-eslint/no-explicit-any */
import './example.css'
import { FunctionComponent } from 'react'
import { useFieldPlugin } from '@storyblok/field-plugin/react'
import PDFMenuConversion from './PDFMenuConversion'
import { MenuResponse } from './types'

const FieldPlugin: FunctionComponent = () => {
  const { type, data, actions } = useFieldPlugin<MenuResponse>({
    enablePortalModal: true,
    validateContent: (content: unknown) => {

      console.log('unknown content check', content)
      if (
        typeof content === 'object' &&
        content !== null &&
        'menu' in content &&
        Array.isArray((content as any).menu)
      ) {
        return { content: content as MenuResponse };
      }

      console.log('returning emplty array');

      return {
        content: {
          menu: [],
        },
      };
    },
  });

  if (type !== 'loaded') {
    return null
  }

  return (
    <PDFMenuConversion data={data} actions={actions} />
  )
}

export default FieldPlugin
