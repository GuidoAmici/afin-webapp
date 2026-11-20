import { notFound } from 'next/navigation'
import { registroClientesFlag } from '@/flags'
import RegistroForm from './registro-form'

// Puerta real del flag `registro-clientes`: apagado, la ruta no existe.
export default async function RegistroPage() {
  if (!(await registroClientesFlag())) notFound()
  return <RegistroForm />
}
