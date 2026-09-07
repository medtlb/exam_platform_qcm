import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { useAuthStore } from "../../store/authStore";
import { assetUrl } from "../../lib/assets";

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const ok = await login(username.trim(), password);
    setBusy(false);
    if (ok) {
      navigate("/", { replace: true });
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-ink/15 bg-paper-2 p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={assetUrl("emblem.png")} alt="" className="h-16 w-16 object-contain" />
          <h1 className="font-kufi text-[length:var(--text-scale-3)] font-bold text-green-dk">
            منصة تدريب على مباريات التوظيف
          </h1>
        </div>

        <label className="mb-3 block text-[length:var(--text-scale-5)]">
          اسم المستخدم
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border border-ink/30 bg-paper-2 px-3 py-2 focus:border-brass"
            autoFocus
          />
        </label>

        <label className="mb-4 block text-[length:var(--text-scale-5)]">
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-ink/30 bg-paper-2 px-3 py-2 focus:border-brass"
          />
        </label>

        {error && <p className="mb-4 text-[length:var(--text-scale-5)] text-stamp">{error}</p>}

        <Button type="submit" disabled={busy} className="w-full">
          دخول
        </Button>
      </form>
    </div>
  );
}
