"use client";

import { useEffect, useRef, useState } from "react";
import {
  getHomeDraft, saveHomeDraft, publishHome, uploadHomeMedia,
  type ApiError, type HomeData,
} from "@/lib/api";
import { normalizeHomeData } from "@/lib/home";

const INPUT = "w-full border border-line bg-white rounded-sm px-3 py-2 text-sm text-char outline-none focus:border-gold";
const LABEL = "block text-xs uppercase tracking-wide text-mute mb-1";

export default function AdminHomePage() {
  const [content, setContent] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const draft = await getHomeDraft();
        setContent(normalizeHomeData(draft.data));
        setVersion(draft.version);
      } catch (err) {
        setError((err as ApiError).message ?? "Failed to load home content");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const patch = (updater: (c: HomeData) => HomeData) => setContent((c) => (c ? updater(c) : c));

  const save = async () => {
    if (!content) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await saveHomeDraft(content);
      setVersion(res.version);
      setMessage("Draft saved.");
    } catch (err) {
      setError((err as ApiError).message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!content) return;
    if (!confirm("Publish these changes live to the public homepage?")) return;
    setPublishing(true);
    setMessage(null);
    setError(null);
    try {
      await saveHomeDraft(content);
      const res = await publishHome();
      setVersion(res.version);
      setMessage(`Published live — version ${res.version}.`);
    } catch (err) {
      setError((err as ApiError).message ?? "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <section className="max-w-4xl mx-auto px-8 py-12"><p className="text-mute text-sm">Loading…</p></section>;
  }
  if (!content) {
    return <section className="max-w-4xl mx-auto px-8 py-12"><p className="text-sm text-red-700">{error ?? "Not available"}</p></section>;
  }

  return (
    <section className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-gold-dark uppercase tracking-[4px] text-xs mb-3 font-semibold">Home content</p>
          <h1 className="font-display text-4xl text-navy">Edit the homepage</h1>
          <p className="mt-2 text-sm text-mute">Changes are saved as a draft. Publish to push them live.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-sm text-gold-dark font-semibold hover:text-navy">View site ↗</a>
          <button onClick={save} disabled={saving}
            className="rounded-sm border border-navy/20 px-4 py-2.5 text-sm text-navy transition hover:bg-navy hover:text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button onClick={publish} disabled={publishing}
            className="rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-gold disabled:opacity-60">
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {message && <p className="mb-4 rounded-sm border-l-2 border-green-600 bg-green-50 px-4 py-2 text-sm text-green-800">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      <p className="mb-8 text-xs text-mute">Current published version: {version}</p>

      <Card title="Hero">
        <div className="space-y-4">
          <Field label="Kicker" value={content.hero.kicker} onChange={(v) => patch((c) => ({ ...c, hero: { ...c.hero, kicker: v } }))} />
          <div>
            <label className={LABEL}>Title (HTML allowed, e.g. &lt;em&gt;growth&lt;/em&gt;)</label>
            <textarea className={INPUT} rows={2} value={content.hero.titleHtml}
              onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, titleHtml: e.target.value } }))} />
          </div>
          <div>
            <label className={LABEL}>Lead paragraph</label>
            <textarea className={INPUT} rows={3} value={content.hero.lead}
              onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, lead: e.target.value } }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary button label" value={content.hero.primaryLabel} onChange={(v) => patch((c) => ({ ...c, hero: { ...c.hero, primaryLabel: v } }))} />
            <Field label="Primary button link" value={content.hero.primaryHref} onChange={(v) => patch((c) => ({ ...c, hero: { ...c.hero, primaryHref: v } }))} />
            <Field label="Secondary button label" value={content.hero.secondaryLabel} onChange={(v) => patch((c) => ({ ...c, hero: { ...c.hero, secondaryLabel: v } }))} />
            <Field label="Secondary button link" value={content.hero.secondaryHref} onChange={(v) => patch((c) => ({ ...c, hero: { ...c.hero, secondaryHref: v } }))} />
          </div>
        </div>
      </Card>

      <Card title="Stats" onAdd={() => patch((c) => ({ ...c, stats: [...c.stats, { target: 0, prefix: "", suffix: "", label: "New stat" }] }))}>
        <div className="space-y-4">
          {content.stats.map((st, i) => (
            <Row key={i} onRemove={() => patch((c) => ({ ...c, stats: c.stats.filter((_, j) => j !== i) }))}>
              <div className="grid grid-cols-4 gap-3">
                <NumField label="Target" value={st.target} onChange={(v) => patch((c) => ({ ...c, stats: replace(c.stats, i, { ...st, target: v }) }))} />
                <Field label="Prefix" value={st.prefix} onChange={(v) => patch((c) => ({ ...c, stats: replace(c.stats, i, { ...st, prefix: v }) }))} />
                <Field label="Suffix" value={st.suffix} onChange={(v) => patch((c) => ({ ...c, stats: replace(c.stats, i, { ...st, suffix: v }) }))} />
                <Field label="Label" value={st.label} onChange={(v) => patch((c) => ({ ...c, stats: replace(c.stats, i, { ...st, label: v }) }))} />
              </div>
            </Row>
          ))}
        </div>
      </Card>

      <Card title="Work / gallery slides" onAdd={() => patch((c) => ({ ...c, slides: [...c.slides, { heading: "New slide", text: "", imageUrl: null, bg: "linear-gradient(135deg,#03122E,#0a2350)" }] }))}>
        <div className="space-y-5">
          {content.slides.map((s, i) => (
            <Row key={i} onRemove={() => patch((c) => ({ ...c, slides: c.slides.filter((_, j) => j !== i) }))}>
              <div className="space-y-3">
                <Field label="Heading" value={s.heading} onChange={(v) => patch((c) => ({ ...c, slides: replace(c.slides, i, { ...s, heading: v }) }))} />
                <Field label="Caption" value={s.text} onChange={(v) => patch((c) => ({ ...c, slides: replace(c.slides, i, { ...s, text: v }) }))} />
                <MediaField
                  url={s.imageUrl}
                  fallback={s.bg}
                  onUploaded={(url) => patch((c) => ({ ...c, slides: replace(c.slides, i, { ...s, imageUrl: url }) }))}
                  onClear={() => patch((c) => ({ ...c, slides: replace(c.slides, i, { ...s, imageUrl: null }) }))}
                  onError={setError}
                />
              </div>
            </Row>
          ))}
        </div>
      </Card>

      <Card title="Contact details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" value={content.contact.email} onChange={(v) => patch((c) => ({ ...c, contact: { ...c.contact, email: v } }))} />
          <Field label="Phone" value={content.contact.phone} onChange={(v) => patch((c) => ({ ...c, contact: { ...c.contact, phone: v } }))} />
          <Field label="Location" value={content.contact.location} onChange={(v) => patch((c) => ({ ...c, contact: { ...c.contact, location: v } }))} />
          <Field label="Website" value={content.contact.web} onChange={(v) => patch((c) => ({ ...c, contact: { ...c.contact, web: v } }))} />
        </div>
      </Card>

      <Card title="Social media" onAdd={() => patch((c) => ({ ...c, socials: [...c.socials, { label: "Instagram", url: "", iconUrl: null }] }))}>
        {content.socials.length === 0 && <p className="mb-3 text-sm text-mute">No social links yet. Add one and upload its icon (e.g. Instagram).</p>}
        <div className="space-y-4">
          {content.socials.map((s, i) => (
            <Row key={i} onRemove={() => patch((c) => ({ ...c, socials: c.socials.filter((_, j) => j !== i) }))}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name (e.g. Instagram)" value={s.label} onChange={(v) => patch((c) => ({ ...c, socials: replace(c.socials, i, { ...s, label: v }) }))} />
                  <Field label="Link (URL)" value={s.url} onChange={(v) => patch((c) => ({ ...c, socials: replace(c.socials, i, { ...s, url: v }) }))} />
                </div>
                <MediaField
                  url={s.iconUrl}
                  fallback="#03122E"
                  onUploaded={(url) => patch((c) => ({ ...c, socials: replace(c.socials, i, { ...s, iconUrl: url }) }))}
                  onClear={() => patch((c) => ({ ...c, socials: replace(c.socials, i, { ...s, iconUrl: null }) }))}
                  onError={setError}
                />
              </div>
            </Row>
          ))}
        </div>
      </Card>

      <Card title="Insights posts" onAdd={() => patch((c) => ({ ...c, posts: [...c.posts, { meta: "Category · 3 min read", title: "New post", excerpt: "", imageUrl: null, thumb: "linear-gradient(135deg,#03122E,#0a2350)", body: [""] }] }))}>
        <div className="space-y-5">
          {content.posts.map((p, i) => (
            <Row key={i} onRemove={() => patch((c) => ({ ...c, posts: c.posts.filter((_, j) => j !== i) }))}>
              <div className="space-y-3">
                <Field label="Meta (e.g. Funding · 5 min read)" value={p.meta} onChange={(v) => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, meta: v }) }))} />
                <Field label="Title" value={p.title} onChange={(v) => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, title: v }) }))} />
                <Field label="Excerpt" value={p.excerpt} onChange={(v) => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, excerpt: v }) }))} />
                <MediaField
                  url={p.imageUrl}
                  fallback={p.thumb}
                  onUploaded={(url) => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, imageUrl: url }) }))}
                  onClear={() => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, imageUrl: null }) }))}
                  onError={setError}
                />
                <div>
                  <label className={LABEL}>Body paragraphs</label>
                  <div className="space-y-2">
                    {p.body.map((para, j) => (
                      <div key={j} className="flex gap-2">
                        <textarea className={INPUT} rows={2} value={para}
                          onChange={(e) => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, body: replace(p.body, j, e.target.value) }) }))} />
                        <button onClick={() => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, body: p.body.filter((_, k) => k !== j) }) }))}
                          className="shrink-0 rounded-sm border border-red-300 px-2 text-xs text-red-700">×</button>
                      </div>
                    ))}
                    <button onClick={() => patch((c) => ({ ...c, posts: replace(c.posts, i, { ...p, body: [...p.body, ""] }) }))}
                      className="text-xs font-semibold text-gold-dark">+ Add paragraph</button>
                  </div>
                </div>
              </div>
            </Row>
          ))}
        </div>
      </Card>
    </section>
  );
}

function replace<T>(arr: T[], i: number, item: T): T[] {
  return arr.map((x, j) => (j === i ? item : x));
}

function Card({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="mb-6 rounded-lg border border-line bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg text-navy">{title}</h3>
        {onAdd && <button onClick={onAdd} className="text-sm font-semibold text-gold-dark hover:text-navy">+ Add</button>}
      </div>
      {children}
    </div>
  );
}

function Row({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-sm border border-line bg-ivory/40 p-4">
      <button onClick={onRemove} className="absolute right-2 top-2 rounded-sm border border-red-300 px-2 py-0.5 text-xs text-red-700 hover:bg-red-700 hover:text-white">Remove</button>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input className={INPUT} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input className={INPUT} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function MediaField({
  url, fallback, onUploaded, onClear, onError,
}: {
  url: string | null;
  fallback: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
  onError: (m: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isVideo = url ? /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) : false;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      onUploaded(await uploadHomeMedia(file));
    } catch (err) {
      onError((err as ApiError).message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={LABEL}>Image / video</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-28 shrink-0 overflow-hidden rounded-sm border border-line" style={{ background: fallback, backgroundSize: "cover", backgroundPosition: "center", ...(url && !isVideo ? { backgroundImage: `url(${url})` } : {}) }}>
          {url && isVideo && <video src={url} className="h-full w-full object-cover" muted />}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="rounded-sm border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy hover:text-white disabled:opacity-60">
            {uploading ? "Uploading…" : url ? "Replace media" : "Upload media"}
          </button>
          {url && <button type="button" onClick={onClear} className="text-xs text-red-700">Remove media (use gradient)</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/*,video/*" onChange={onFile} className="hidden" />
      </div>
    </div>
  );
}
