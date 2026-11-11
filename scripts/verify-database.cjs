/* eslint-disable @typescript-eslint/no-require-imports */
const {PrismaClient}=require('@prisma/client');
const {randomUUID}=require('node:crypto');
const assert=require('node:assert/strict');
const db=new PrismaClient();
async function main(){
 const suffix=randomUUID();const first='verify_a_'+suffix,second='verify_b_'+suffix;
 const rollback=new Error('ROLLBACK_VERIFICATION');
 try{await db.$transaction(async tx=>{
  const a=await tx.user.create({data:{clerkId:first,email:first+'@verification.invalid'}});
  const b=await tx.user.create({data:{clerkId:second,email:second+'@verification.invalid'}});
  const asset=await tx.asset.create({data:{userId:a.id,name:'Verification position',type:'ETF',category:'ETF',value:100,currency:'CHF',fxRate:1,annualFeePercent:.2}});
  assert.equal((await tx.asset.findMany({where:{userId:b.id}})).length,0);
  assert.equal((await tx.asset.updateMany({where:{id:asset.id,userId:b.id},data:{value:999}})).count,0);
  assert.equal((await tx.asset.deleteMany({where:{id:asset.id,userId:b.id}})).count,0);
  assert.equal((await tx.asset.findUnique({where:{id:asset.id}})).value,100);
  const goal=await tx.goal.create({data:{userId:a.id,name:'Verification goal',targetAmount:1000,deadline:new Date('2030-01-01')}});
  assert.equal((await tx.goal.updateMany({where:{id:goal.id,userId:b.id},data:{currentAmount:1000}})).count,0);
  await tx.wealthSnapshot.create({data:{userId:a.id,day:'2000-01-01',gross:100,debt:0,net:100}});
  assert.equal(await tx.wealthSnapshot.count({where:{userId:a.id}}),1);
  throw rollback;
 },{timeout:20000});}catch(e){if(e!==rollback)throw e;}
 assert.equal(await db.user.count({where:{clerkId:{in:[first,second]}}}),0);
 console.log('Database integration checks passed: assets, goals, snapshots, owner scoping; test transaction rolled back.');
}
main().catch(e=>{console.error('Database verification failed:',e.code||e.name);process.exitCode=1;}).finally(()=>db.$disconnect());
