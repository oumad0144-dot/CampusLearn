import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uuhxcjkgpryxwyeumnyt.supabase.co'

const supabaseKey = 'sb_publishable_iLBCj9GSuJyxDOXQ6ffVyg_p3VDRm4E'

export const supabase = createClient(supabaseUrl, supabaseKey)