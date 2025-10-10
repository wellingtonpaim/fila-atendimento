import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export type SearchMode = { value: string; label: string };

type UnitFilter = {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
  title?: string;
};

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
  modes: SearchMode[];
  mode: string;
  onModeChange: (v: string) => void;
  rightSlot?: React.ReactNode; // para filtros adicionais como select de unidade (compatibilidade)
  onClear?: () => void; // botão limpar pesquisa
  unitFilter?: UnitFilter; // submenu de unidades quando modo for "porUnidade"
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar...',
  loading,
  modes,
  mode,
  onModeChange,
  rightSlot,
  onClear,
  unitFilter,
}) => {
  const handleClear = () => {
    if (onClear) onClear();
    else onChange('');
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          className="pr-10 h-11 md:h-12 text-base"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8">
              <DotsHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Selecionar modo de busca</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {modes.map((m) => {
              if (m.value === 'porUnidade' && unitFilter) {
                return (
                  <DropdownMenuSub key={m.value}>
                    <DropdownMenuSubTrigger>{m.label}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-64">
                      {unitFilter.title && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">{unitFilter.title}</div>
                      )}
                      {unitFilter.options.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => {
                            onModeChange('porUnidade');
                            unitFilter.onChange(opt.value);
                          }}
                          className={unitFilter.value === opt.value ? 'font-medium' : ''}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              }
              return (
                <DropdownMenuItem
                  key={m.value}
                  onClick={() => onModeChange(m.value)}
                  className={mode === m.value ? 'font-medium' : ''}
                >
                  {m.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {rightSlot}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleClear} disabled={loading}>Limpar</Button>
        <Button onClick={onSubmit} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</Button>
      </div>
    </div>
  );
};

export default SearchBar;
