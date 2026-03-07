'use client'
import { useRouter } from 'next/navigation'

export default function AboutPage(){

const router = useRouter()

const pipeline = [

{
step:"1",
label:"ผู้ใช้กรอกอาการ",
desc:"ผู้ใช้เลือกอาการของสัตว์เลี้ยง เช่น อาเจียน ซึม ไม่กินอาหาร",
color:"#0d9488"
},

{
step:"2",
label:"ระบบประเมินอาการ",
desc:"Decision Tree วิเคราะห์ระดับความเสี่ยงเบื้องต้น",
color:"#0d9488"
},

{
step:"3",
label:"แนะนำข้อมูลที่เกี่ยวข้อง",
desc:"ระบบแนะนำบทความสุขภาพสัตว์เลี้ยงที่เกี่ยวข้อง",
color:"#2563eb"
},

{
step:"4",
label:"AI อธิบายเพิ่มเติม",
desc:"AI ช่วยอธิบายข้อมูลให้เข้าใจง่ายขึ้น",
color:"#7c3aed"
},

{
step:"5",
label:"แสดงคำแนะนำเบื้องต้น",
desc:"ผู้ใช้ได้รับคำแนะนำและแนวทางดูแลสัตว์เลี้ยง",
color:"#0d9488"
}

]

const techStack = [

{
name:"Next.js",
role:"Frontend + Backend",
why:"สร้าง Web Application ได้ในระบบเดียว"
},

{
name:"Firebase Auth",
role:"Authentication",
why:"ใช้สำหรับระบบผู้ใช้งาน"
},

{
name:"Firestore",
role:"Database",
why:"เก็บข้อมูลผู้ใช้และประวัติการตรวจอาการ"
},

{
name:"Decision Tree",
role:"Symptom Analysis",
why:"ใช้วิเคราะห์อาการสัตว์เลี้ยงเบื้องต้น"
},

{
name:"Gemini API",
role:"AI Assistant",
why:"ช่วยอธิบายข้อมูลสุขภาพสัตว์"
},

{
name:"Vercel",
role:"Deployment",
why:"ใช้สำหรับ deploy web application"
}

]

const sources = [

{
name:"PetMD",
url:"https://www.petmd.com",
desc:"บทความเกี่ยวกับโรคและอาการสัตว์เลี้ยง"
},

{
name:"ASPCA",
url:"https://www.aspca.org",
desc:"ข้อมูลสารพิษและความปลอดภัย"
},

{
name:"VCA Animal Hospitals",
url:"https://vcahospitals.com/",
desc:"ข้อมูลสัตวแพทย์และการดูแลสัตว์"
}

]

return(

<div style={{
background:"#f9fafb",
minHeight:"100vh",
fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui'
}}>

<main style={{
maxWidth:"680px",
margin:"0 auto",
padding:"40px 24px"
}}>

{/* Header */}

<div style={{marginBottom:"40px"}}>

<div style={{
display:"inline-flex",
alignItems:"center",
gap:"6px",
background:"#f0fdfa",
border:"1px solid #99f6e4",
borderRadius:"999px",
padding:"4px 14px",
fontSize:"12px",
fontWeight:"600",
color:"#0f766e",
marginBottom:"16px"
}}>
เกี่ยวกับโปรเจกต์
</div>

<h1 style={{
fontSize:"28px",
fontWeight:"800",
margin:"0 0 12px"
}}>
PetHealth คืออะไร
</h1>

<p style={{
fontSize:"15px",
color:"#6b7280",
lineHeight:"1.7",
margin:0
}}>
PetHealth เป็นเว็บแอปที่ช่วยให้เจ้าของสัตว์เลี้ยงสามารถตรวจสอบอาการเบื้องต้นของสัตว์เลี้ยง และค้นหาข้อมูลสุขภาพสัตว์จากแหล่งที่เชื่อถือได้
</p>

</div>

{/* Problem */}

<div style={{
background:"white",
borderRadius:"14px",
border:"1px solid #e5e7eb",
padding:"24px",
marginBottom:"16px"
}}>

<h2 style={{
fontSize:"16px",
fontWeight:"700",
marginBottom:"14px"
}}>
ปัญหาที่โครงงานนี้ต้องการแก้
</h2>

<ul style={{lineHeight:1.8}}>

<li>
ระบบคัดกรองอาการโดยใช้ Decision Tree สามารถช่วยวิเคราะห์รูปแบบอาการจากข้อมูลที่ผู้ใช้กรอก 
เพื่อประเมินระดับความเสี่ยงของอาการ และแนะนำแนวทางการดูแลเบื้องต้นได้
</li>

</ul>

</div>

{/* Pipeline */}

<div style={{
background:"white",
borderRadius:"14px",
border:"1px solid #e5e7eb",
padding:"24px",
marginBottom:"16px"
}}>

<h2 style={{
fontSize:"16px",
fontWeight:"700",
marginBottom:"16px"
}}>
ระบบทำงานอย่างไร
</h2>

{pipeline.map((p,i)=>(

<div key={i} style={{display:"flex",gap:"12px",marginBottom:"14px"}}>

<div style={{
width:"28px",
height:"28px",
borderRadius:"50%",
background:p.color,
color:"white",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"12px",
fontWeight:"700"
}}>
{p.step}
</div>

<div>

<p style={{
fontWeight:"600",
margin:"0 0 2px"
}}>
{p.label}
</p>

<p style={{
fontSize:"13px",
color:"#6b7280",
margin:0
}}>
{p.desc}
</p>

</div>

</div>

))}

</div>

{/* Tech stack */}

<div style={{
background:"white",
borderRadius:"14px",
border:"1px solid #e5e7eb",
padding:"24px",
marginBottom:"16px"
}}>

<h2 style={{
fontSize:"16px",
fontWeight:"700",
marginBottom:"16px"
}}>
Tech Stack
</h2>

{techStack.map((t,i)=>(

<div key={i} style={{
display:"flex",
justifyContent:"space-between",
padding:"8px 0"
}}>

<span style={{fontWeight:"600"}}>
{t.name}
</span>

<span style={{
fontSize:"13px",
color:"#6b7280"
}}>
{t.role}
</span>

</div>

))}

</div>

{/* Sources */}

<div style={{
background:"white",
borderRadius:"14px",
border:"1px solid #e5e7eb",
padding:"24px",
marginBottom:"24px"
}}>

<h2 style={{
fontSize:"16px",
fontWeight:"700",
marginBottom:"16px"
}}>
แหล่งข้อมูล
</h2>

{sources.map((s,i)=>(

<a
key={i}
href={s.url}
target="_blank"
style={{
display:"block",
padding:"10px 0",
textDecoration:"none",
color:"#0d9488"
}}
>

{s.name}

</a>

))}

</div>

{/* CTA */}

<div style={{
display:"flex",
justifyContent:"center",
gap:"10px"
}}>

<button
onClick={()=>router.push('/symptom-check')}
style={{
padding:"10px 20px",
background:"#0d9488",
color:"white",
border:"none",
borderRadius:"8px"
}}
>
ตรวจอาการสัตว์เลี้ยง
</button>

<button
onClick={()=>router.push('/articles')}
style={{
padding:"10px 20px",
border:"1px solid #e5e7eb",
background:"white",
borderRadius:"8px"
}}
>
อ่านบทความ
</button>

</div>

</main>

</div>

)
}
