'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import type { Child } from '@/lib/supabase'

interface ChildContextValue {
  children: Child[]
  selectedChildId: string | null
  setSelectedChildId: (id: string) => void
  selectedChild: Child | undefined
  loading: boolean
}

const ChildContext = createContext<ChildContextValue>({
  children: [],
  selectedChildId: null,
  setSelectedChildId: () => {},
  selectedChild: undefined,
  loading: true,
})

export function ChildProvider({ children: childrenProp }: { children: ReactNode }) {
  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) { setLoading(false); return }

      const { data: kids } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parent.id)
        .order('created_at')

      if (kids && kids.length > 0) {
        setChildrenList(kids)
        setSelectedChildId(kids[0].id)
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
    }}>
      {childrenProp}
    </ChildContext.Provider>
  )
}

export function useChild() {
  return useContext(ChildContext)
}
