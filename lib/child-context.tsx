'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import type { Child } from '@/lib/supabase'

export interface ChildContextValue {
  children: Child[]
  selectedChildId: string | null
  setSelectedChildId: (id: string) => void
  selectedChild: Child | undefined
  loading: boolean
  familyId: string | null
  permissions: 'full' | 'read_only' | null
}

// Exported so dev/preview tooling can provide a mock value; app code should
// use ChildProvider + useChild.
export const ChildContext = createContext<ChildContextValue>({
  children: [],
  selectedChildId: null,
  setSelectedChildId: () => {},
  selectedChild: undefined,
  loading: true,
  familyId: null,
  permissions: null,
})

export function ChildProvider({ children: childrenProp }: { children: ReactNode }) {
  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<'full' | 'read_only' | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) { setLoading(false); return }

      // Get family membership
      const { data: membership } = await supabase
        .from('family_members')
        .select('family_id, permissions')
        .eq('parent_id', parent.id)
        .limit(1)
        .single()

      if (membership) {
        setFamilyId(membership.family_id)
        setPermissions(membership.permissions)

        // Load children via family (supports co-parent access)
        const { data: kids } = await supabase
          .from('children')
          .select('*')
          .eq('family_id', membership.family_id)
          .order('created_at')

        if (kids && kids.length > 0) {
          setChildrenList(kids)
          setSelectedChildId(kids[0].id)
        }
      } else {
        // Fallback: load by parent_id for backwards compatibility during migration
        const { data: kids } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', parent.id)
          .order('created_at')

        if (kids && kids.length > 0) {
          setChildrenList(kids)
          setSelectedChildId(kids[0].id)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const selectedChild = childrenList.find(c => c.id === selectedChildId)

  return (
    <ChildContext.Provider value={{
      children: childrenList,
      selectedChildId,
      setSelectedChildId,
      selectedChild,
      loading,
      familyId,
      permissions,
    }}>
      {childrenProp}
    </ChildContext.Provider>
  )
}

export function useChild() {
  return useContext(ChildContext)
}
