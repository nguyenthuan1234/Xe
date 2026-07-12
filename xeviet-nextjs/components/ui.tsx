"use client";

import type { ReactNode, ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";

export function Chip({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const styles: Record<string, string> = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-violet-100 text-violet-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer select-none shrink-0";
  const variants: Record<string, string> = {
    primary: "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35",
    secondary: "bg-blue-50 hover:bg-blue-100 text-blue-700 active:scale-[0.98]",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-[0.98]",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
    danger: "bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-base rounded-2xl",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  className = "",
  defaultValue,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
      <p className="text-sm text-red-600 font-medium mb-3">{message}</p>
      {onRetry && (
        <Btn size="sm" variant="danger" onClick={onRetry}>
          Thử lại
        </Btn>
      )}
    </div>
  );
}
export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
