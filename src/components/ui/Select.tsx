import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...rest }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none pl-3.5 pr-9 py-2.5 text-sm border rounded-lg bg-white text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            invalid ? 'border-rose-300' : 'border-slate-300',
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>
    )
  }
)
Select.displayName = 'Select'

export default Select
