import React from 'react'

export const SectionHeader = ({ title, icon }: { title: string, icon: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
    <span className="text-xl">{icon}</span>
    <h3 className="text-lg font-bold text-gray-200">{title}</h3>
  </div>
)

export const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "", 
  min,
  color = "text-white",
  width = "w-full"
}: { 
  label: string, 
  value: string | number, 
  onChange: (val: string) => void, 
  type?: string, 
  placeholder?: string,
  min?: number,
  color?: string,
  width?: string
}) => (
  <div className="bg-black/20 rounded p-3 border border-white/5">
    <div className="text-xs text-gray-400 mb-1 font-medium">{label}</div>
    <input
      type={type}
      min={min}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${width} bg-transparent border-b border-white/30 font-bold ${color} focus:outline-none focus:border-[#6eb5ff] transition-colors`}
    />
  </div>
)

export const SelectField = ({ 
  label, 
  value, 
  options, 
  onChange, 
  color = "text-white" 
}: { 
  label: string, 
  value: string, 
  options: string[], 
  onChange: (val: string) => void, 
  color?: string 
}) => (
  <div className="bg-black/20 rounded p-3 border border-white/5">
    <div className="text-xs text-gray-400 mb-1 font-medium">{label}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-black/40 rounded px-2 py-1 border border-white/20 font-bold ${color} focus:outline-none focus:border-[#6eb5ff]`}
    >
      {options.map(opt => (
        <option key={opt} value={opt} className="bg-[#242424]">{opt.replace(/_/g, ' ')}</option>
      ))}
    </select>
  </div>
)

export const BooleanToggle = ({
  label,
  value,
  onChange,
  color = "text-cyan-400"
}: {
  label: string,
  value: boolean,
  onChange: (val: boolean) => void,
  color?: string
}) => (
  <div className="bg-black/20 rounded p-3 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/30 transition-colors" onClick={() => onChange(!value)}>
    <div className="text-xs text-gray-400 font-medium">{label}</div>
    <div className={`font-bold ${value ? color : 'text-gray-600'}`}>
      {value ? 'YES' : 'NO'}
    </div>
  </div>
)
