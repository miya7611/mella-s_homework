import { LoginForm } from '../components/auth';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">作业管理系统</h1>
          <p className="mt-2 text-muted-foreground">欢迎回来，请登录您的账号</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
