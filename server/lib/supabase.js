const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY
const bucketName = process.env.SUPABASE_BUCKET || 'uploads'

let supabase
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

async function uploadImage(buffer, filename, contentType) {
  if (!supabase) throw new Error('Supabase is not configured')

  const path = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${filename}`
  const { error } = await supabase.storage.from(bucketName).upload(path, buffer, {
    contentType,
    upsert: false
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
}

module.exports = { supabase, uploadImage }