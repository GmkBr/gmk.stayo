import { Search } from 'lucide-react'
import { Input } from './Input.tsx'
import type { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export function SearchInput({ label, placeholder = 'Buscar', ...props }: Props) {
  return (
    <Input
      label={label}
      type="search"
      placeholder={placeholder}
      icon={<Search size={15} />}
      {...props}
    />
  )
}
