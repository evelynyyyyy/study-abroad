import { afterAll, describe, expect, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { requestCandidates } from '../src/engine/index'

// Runs INSIDE a pinned checkout of nieyuyao/simple-ime, using its real engine,
// real dictionary and segmentation. No TOPIK candidate map or target injection.
const cases: Record<string,string> = {
  jian:'间', cheng:'成', chengwei:'成为', shijian:'时间',
  fangjian:'房间', zhongjian:'中间', xuesheng:'学生',
  xuexi:'学习', gongzuo:'工作', pengyou:'朋友',
  keyi:'可以', ranhou:'然后',
}
const results: Array<{pinyin:string;expected:string;found:boolean;count:number;topCandidates:string[];durationMs:number}> = []
describe('TOPIK independent upstream simple-ime engine acceptance', () => {
  for (const [pinyin, expected] of Object.entries(cases)) {
    it(`${pinyin} contains ${expected}`, () => {
      const t = performance.now()
      const candidates = requestCandidates(pinyin).candidates.map(c => c.w)
      const durationMs = performance.now()-t
      const found = candidates.includes(expected)
      results.push({pinyin,expected,found,count:candidates.length,topCandidates:candidates.slice(0,50),durationMs})
      console.log(JSON.stringify({engine:'simple-ime',pinyin,candidateCount:candidates.length,candidates:candidates.slice(0,50),expected,found,durationMs}))
      expect(candidates).toContain(expected)
    })
  }
  afterAll(() => {
    const report = {engine:'simple-ime',upstream:'nieyuyao/simple-ime',upstreamCommit:process.env.IME_UPSTREAM_SHA,
      generatedAt:new Date().toISOString(),total:Object.keys(cases).length,
      passed:results.filter(r=>r.found).length,failed:results.filter(r=>!r.found).length,results}
    writeFileSync(process.env.IME_RESULTS_PATH || '/tmp/topik-ime-results.json',JSON.stringify(report,null,2)+'\n')
  })
})
