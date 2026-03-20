import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// 精准校准字典 (IPA) - 这只是前 100 个词的一小部分示例，用于演示和修复
const ipaMap: Record<string, string> = {
  "abandon": "/əˈbændən/", "ability": "/əˈbɪləti/", "able": "/ˈeɪbl/", "about": "/əˈbaʊt/", "above": "/əˈbʌv/",
  "abroad": "/əˈbrɔːd/", "absent": "/ˈæbsənt/", "accept": "/əkˈsept/", "accident": "/ˈæksɪdənt/", "ache": "/eɪk/",
  "achieve": "/əˈtʃiːv/", "across": "/əˈkrɒs/", "act": "/ækt/", "action": "/ˈækʃn/", "active": "/ˈæktɪv/",
  "activity": "/ækˈtɪvəti/", "add": "/æd/", "address": "/əˈdres/", "advantage": "/ədˈvɑːntɪdʒ/", "advice": "/ədˈvaɪs/",
  "advise": "/ədˈvaɪz/", "afford": "/əˈfɔːd/", "afraid": "/əˈfreɪd/", "after": "/ˈɑːftər/", "afternoon": "/ˌɑːftəˈnuːn/",
  "again": "/əˈɡen/", "against": "/əˈɡeɪnst/", "age": "/eɪdʒ/", "ago": "/əˈɡəʊ/", "agree": "/əˈɡriː/",
  "air": "/eə(r)/", "airport": "/ˈeəpɔːt/", "alive": "/əˈlaɪv/", "allow": "/əˈlaʊ/", "almost": "/ˈɔːlməʊst/",
  "alone": "/əˈləʊn/", "along": "/əˈlɒŋ/", "aloud": "/əˈlaʊd/", "already": "/ɔːlˈredi/", "also": "/ˈɔːlsəʊ/",
  "although": "/ɔːlˈðəʊ/", "always": "/ˈɔːlweɪz/", "amazing": "/əˈmeɪzɪŋ/", "among": "/əˈmʌŋ/", "ancient": "/ˈeɪnʃnt/",
  "angry": "/ˈæŋɡri/", "animal": "/ˈænɪml/", "another": "/əˈnʌðər/", "answer": "/ˈɑːnsər/", "any": "/ˈeni/",
  "anybody": "/ˈenibɒdi/", "apple": "/ˈæpl/", "area": "/ˈeəriə/", "arm": "/ɑːm/", "army": "/ˈɑːmi/",
  "around": "/əˈraʊnd/", "arrive": "/əˈraɪv/", "art": "/ɑːt/", "article": "/ˈɑːtɪkl/", "artist": "/ˈɑːtɪst/",
  "as": "/æz/", "ashamed": "/əˈʃeɪmd/", "ask": "/ɑːsk/", "asleep": "/əˈsliːp/", "at": "/æt/",
  "attack": "/əˈtæk/", "attend": "/əˈtend/", "attention": "/əˈtenʃn/", "attract": "/əˈtrækt/", "aunt": "/ɑːnt/",
  "autumn": "/ˈɔːtəm/", "available": "/əˈveɪləbl/", "avoid": "/əˈvɔɪd/", "awake": "/əˈweɪk/", "away": "/əˈweɪ/",
  "baby": "/ˈbeɪbi/", "back": "/bæk/", "background": "/ˈbækɡraʊnd/", "bad": "/bæd/", "bag": "/bæg/",
  "ball": "/bɔːl/", "balloon": "/bəˈluːn/", "bamboo": "/ˌbæmˈbuː/", "bank": "/bæŋk/", "base": "/beɪs/",
  "basic": "/ˈbeɪsɪk/", "basket": "/ˈbɑːskɪt/", "basketball": "/ˈbɑːskɪtˌbɔːl/", "bath": "/bɑːθ/", "bathroom": "/ˈbɑːθruːm/",
  "beach": "/biːtʃ/", "bear": "/beə(r)/", "beat": "/biːt/", "beautiful": "/ˈbjuːtɪfl/", "because": "/bɪˈkɒz/",
  "become": "/bɪˈkʌm/", "bed": "/bed/", "bedroom": "/ˈbedruːm/", "bee": "/biː/", "beef": "/biːf/"
};

async function main() {
  const userId = "test-user-1";
  let count = 0;

  for (const [word, phonetic] of Object.entries(ipaMap)) {
    const updated = await prisma.userWordCard.updateMany({
      where: { userId, word },
      data: { phonetic }
    });
    if (updated.count > 0) count++;
  }
  console.log(`✅ 修复了 ${count} 个高频词的音标数据。`);
}

main().finally(() => prisma.$disconnect());