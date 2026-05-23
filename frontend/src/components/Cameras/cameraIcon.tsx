import { Camera, Package, ShoppingCart, Users, Video } from 'lucide-react'
import type { MonitoringCamera } from '../../types'

export function cameraIcon(camera: MonitoringCamera) {
  const id = camera.id
  if (id.includes('checkout')) return <ShoppingCart size={16} />
  if (id.includes('warehouse')) return <Package size={16} />
  if (id.includes('entrance') || id.includes('mall')) return <Users size={16} />
  if (id.includes('produce') || id.includes('beverage') || id.includes('frozen')) return <Video size={16} />
  return <Camera size={16} />
}
