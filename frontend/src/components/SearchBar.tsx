import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type SearchMode = { value: string; label: string };

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
  modes: SearchMode[];
  mode: string;
  onModeChange: (v: string) => void;
  rightSlot?: React.ReactNode; // para filtros adicionais como select de unidade
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, placeholder = 'Buscar...', loading, modes, mode, onModeChange, rightSlot }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          className="pr-10"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8">
              <DotsHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Selecionar modo de busca</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {modes.map((m) => (
              <DropdownMenuItem key={m.value} onClick={() => onModeChange(m.value)} className={mode === m.value ? 'font-medium' : ''}>
                {m.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {rightSlot}
      <Button onClick={onSubmit} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</Button>
    </div>
  );
};

export default SearchBar;

