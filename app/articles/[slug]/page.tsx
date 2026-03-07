import { articles } from "@/lib/articles"

export default async function ArticlePage(
{ params }: { params: Promise<{ slug: string }> }
){

const { slug } = await params

const article = articles.find(a=>a.slug===slug)

if(!article){
return <div style={{padding:40}}>Article not found</div>
}

return(

<div style={{
background:"#f9fafb",
minHeight:"100vh",
fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui'
}}>

<main style={{
maxWidth:"720px",
margin:"0 auto",
padding:"32px 24px"
}}>

<h1 style={{
fontSize:"26px",
fontWeight:"800",
marginBottom:"6px"
}}>
{article.icon} {article.title}
</h1>

<p style={{
fontSize:"12px",
color:"#9ca3af",
marginBottom:"24px"
}}>
Source: {article.source}
</p>

<div style={{
background:"white",
borderRadius:"14px",
border:"1px solid #e5e7eb",
padding:"24px"
}}>

{article.sections.map((section,i)=>(
<div key={i} style={{marginBottom:"22px"}}>

<h2 style={{
fontSize:"18px",
fontWeight:"700",
marginBottom:"8px"
}}>
{section.heading}
</h2>

{section.text && (
<p style={{
lineHeight:1.8,
color:"#374151"
}}>
{section.text}
</p>
)}

{section.list && (
<ul style={{
paddingLeft:"20px",
lineHeight:1.8
}}>
{section.list.map((item,j)=>(
<li key={j}>{item}</li>
))}
</ul>
)}

</div>
))}

</div>

<div style={{
marginTop:"20px",
background:"#fefce8",
border:"1px solid #fde68a",
padding:"14px",
borderRadius:"10px"
}}>
<p style={{fontSize:"12px",margin:0}}>
ข้อมูลนี้มีวัตถุประสงค์เพื่อการให้ความรู้เท่านั้น
ไม่สามารถใช้แทนคำแนะนำจากสัตวแพทย์ได้
</p>
</div>

</main>

</div>

)
}
