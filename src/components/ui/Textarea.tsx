import React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none',
          invalid ? 'border-rose-300' : 'border-slate-300',
          className
        )}
        {...rest}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export default Textarea
