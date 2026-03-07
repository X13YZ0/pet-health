'use client'

import Link from "next/link"
import { articles } from "@/lib/articles"

export default function ArticlesPage(){

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

{/* HERO */}

<div style={{
background:"linear-gradient(135deg,#0d9488,#0f766e)",
borderRadius:"16px",
padding:"28px",
marginBottom:"20px",
color:"white"
}}>

<h1 style={{
fontSize:"22px",
fontWeight:"800",
margin:"0 0 10px"
}}>
📚 Pet Care Knowledge Base
</h1>

<p style={{
fontSize:"14px",
opacity:.9
}}>
บทความความรู้เกี่ยวกับสุขภาพสัตว์เลี้ยงและการดูแลสัตว์
</p>

</div>

{/* ARTICLES */}

<div style={{
background:"white",
borderRadius:"14px",
border:"1px solid #e5e7eb",
padding:"20px"
}}>

<h2 style={{
fontSize:"16px",
fontWeight:"700",
marginBottom:"16px"
}}>
บทความทั้งหมด
</h2>

<div style={{
display:"flex",
flexDirection:"column",
gap:"10px"
}}>

{articles.map((article)=>(
<Link
key={article.slug}
href={`/articles/${article.slug}`}
style={{
display:"flex",
gap:"12px",
padding:"14px",
border:"1px solid #e5e7eb",
borderRadius:"10px",
background:"#f9fafb",
textDecoration:"none"
}}
>

<span style={{fontSize:"22px"}}>
{article.icon}
</span>

<div>

<p style={{
fontSize:"14px",
fontWeight:"600",
margin:"0 0 4px",
color:"#111827"
}}>
{article.title}
</p>

<p style={{
fontSize:"12px",
color:"#6b7280"
}}>
{article.desc}
</p>

</div>

</Link>
))}

</div>

</div>

</main>

</div>

)
}
