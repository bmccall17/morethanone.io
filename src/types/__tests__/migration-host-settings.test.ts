import { readFileSync } from 'fs'
import { join } from 'path'

describe('add_host_settings migration', () => {
  const migrationPath = join(__dirname, '../../../supabase/migrations/add_host_settings.sql')
  const sql = readFileSync(migrationPath, 'utf-8')

  test('migration file exists and is not empty', () => {
    expect(sql.length).toBeGreaterThan(0)
  })

  test('backfills host_as_participant into existing rows', () => {
    expect(sql).toContain('host_as_participant')
    expect(sql).toMatch(/UPDATE\s+rounds/i)
  })

  test('backfills show_processing into existing rows', () => {
    expect(sql).toContain('show_processing')
  })

  test('uses jsonb concatenation to preserve existing keys', () => {
    expect(sql).toContain('settings || ')
  })

  test('only updates rows missing the new keys', () => {
    expect(sql).toMatch(/settings\s*\?\s*'host_as_participant'/)
    expect(sql).toMatch(/settings\s*\?\s*'show_processing'/)
  })

  test('updates column default to include all four settings', () => {
    expect(sql).toMatch(/ALTER\s+TABLE\s+rounds/i)
    expect(sql).toMatch(/SET\s+DEFAULT/i)
    const defaultMatch = sql.match(/SET\s+DEFAULT\s+'([^']+)'/i)
    expect(defaultMatch).not.toBeNull()
    const defaultValue = JSON.parse(defaultMatch![1])
    expect(defaultValue).toEqual({
      allowTies: false,
      anonymousResults: false,
      host_as_participant: false,
      show_processing: false,
    })
  })

  test('documents that settings is a JSONB column', () => {
    expect(sql.toLowerCase()).toContain('jsonb')
    expect(sql).toMatch(/comment|JSONB/i)
  })
})
