import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, BookOpen, CalendarDays, RefreshCw, ChevronRight } from "lucide-react";
import { apiRequest } from "@services/api";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");
      const result = await apiRequest("/instructor/students");
      setStudents(Array.isArray(result) ? result : result.data || result.students || []);
    } catch (err) {
      console.error("Load instructor students error:", err);
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStudents(); }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => {
      const name = String(student.name || "").toLowerCase();
      const email = String(student.email || "").toLowerCase();
      const courses = Array.isArray(student.courses) ? student.courses.join(" ").toLowerCase() : "";
      return name.includes(query) || email.includes(query) || courses.includes(query);
    });
  }, [students, search]);

  const totalEnrollments = students.reduce((total, student) => total + (Number(student.courseCount) || 0), 0);

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
  }

  function getInitials(name) {
    if (!name) return "ST";
    return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }

  function openProgress(id) { navigate(`/instructor/students/${id}/progress`); }

  if (loading) {
    return <div className="space-y-6"><div><h1 className="text-xl font-extrabold text-ink">Students</h1><p className="mt-1 text-sm text-slate-500">View students enrolled in your courses.</p></div><section className="rounded-2xl bg-white p-10 text-center shadow"><p className="text-sm text-slate-500">Loading students...</p></section></div>;
  }

  if (error) {
    return <div className="space-y-6"><div><h1 className="text-xl font-extrabold text-ink">Students</h1><p className="mt-1 text-sm text-slate-500">View students enrolled in your courses.</p></div><section className="rounded-2xl bg-white p-8 text-center shadow"><p className="text-sm font-semibold text-red-500">{error}</p><button type="button" onClick={loadStudents} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"><RefreshCw size={15} />Try Again</button></section></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-extrabold text-ink">Students</h1><p className="mt-1 text-sm text-slate-500">View and track students enrolled in your courses.</p></div><button type="button" onClick={loadStudents} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"><RefreshCw size={15}/>Refresh</button></div>
      <div className="grid gap-4 sm:grid-cols-2"><section className="rounded-2xl bg-white p-5 shadow"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary"><Users size={20}/></div><div><p className="text-xs font-semibold text-slate-400">Total Students</p><p className="mt-1 text-2xl font-extrabold text-ink">{students.length}</p></div></div></section><section className="rounded-2xl bg-white p-5 shadow"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary"><BookOpen size={20}/></div><div><p className="text-xs font-semibold text-slate-400">Course Enrollments</p><p className="mt-1 text-2xl font-extrabold text-ink">{totalEnrollments}</p></div></div></section></div>
      <section className="rounded-2xl bg-white shadow"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="text-sm font-bold text-ink">Enrolled Students</h2><p className="mt-1 text-xs text-slate-400">Students enrolled in at least one of your courses. Click a row to view progress.</p></div><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search students..." className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none"/></div></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400"><th className="px-5 py-3">Student</th><th className="px-5 py-3">Courses</th><th className="px-5 py-3">Enrolled Courses</th><th className="px-5 py-3">Last Enrollment</th><th className="px-5 py-3 text-right">Progress</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.map((student)=><tr key={student.id} onClick={()=>openProgress(student.id)} className="cursor-pointer hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-xs font-extrabold text-primary">{getInitials(student.name)}</div><div><p className="font-semibold text-ink">{student.name}</p><p className="text-xs text-slate-400">{student.email}</p></div></div></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary"><BookOpen size={12}/>{student.courseCount ?? 0}</span></td><td className="px-5 py-4"><div className="flex max-w-md flex-wrap gap-1.5">{student.courses?.length ? student.courses.map((course,index)=><span key={`${student.id}-${index}`} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{course}</span>) : <span className="text-xs text-slate-400">No courses</span>}</div></td><td className="px-5 py-4 text-slate-500"><div className="flex items-center gap-2"><CalendarDays size={14}/><span className="text-xs">{formatDate(student.lastEnrollment)}</span></div></td><td className="px-5 py-4"><button type="button" onClick={(event)=>{event.stopPropagation();openProgress(student.id)}} className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-primary">View Progress<ChevronRight size={14}/></button></td></tr>)}{filteredStudents.length===0&&<tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">No students found.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}
