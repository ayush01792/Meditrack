import { useState } from 'react';
import { FileText, Download, Share2, Copy, CheckCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { downloadHealthReport, getDoctorShareToken } from '@/features/reports/api';
import { formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);
  const [shareToken, setShareToken] = useState<{ token: string; expiresAt: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await downloadHealthReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleGenerateShareLink() {
    setGenerating(true);
    try {
      const result = await getDoctorShareToken();
      setShareToken(result);
    } catch {
      toast.error('Failed to generate share link.');
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (!shareToken) return;
    const link = `${window.location.origin}/shared-report/${shareToken.token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Export your health summary or share it with your doctor
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* PDF Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText size={20} className="text-blue-500" />
              </div>
              <div>
                <CardTitle>PDF Health Report</CardTitle>
                <CardDescription>Full summary of your medicines, vitals & adherence</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2">
              {[
                'Medicine schedule & active prescriptions',
                'Dose adherence chart (last 30 days)',
                'Vitals trend — BP, sugar, weight',
                'Missed & snoozed dose log',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button onClick={handleDownload} loading={downloading} className="w-full gap-2">
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={15} /> Download PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Doctor Share */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Share2 size={20} className="text-green-500" />
              </div>
              <div>
                <CardTitle>Doctor Share View</CardTitle>
                <CardDescription>Generate a secure, read-only link for your doctor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2">
              {[
                'Secure tokenized link (expires in 48h)',
                'Read-only — no account needed',
                'Shows vitals, medicines & adherence',
                'Revocable at any time',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  {item}
                </li>
              ))}
            </ul>

            {shareToken ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <p className="flex-1 truncate text-xs text-muted-foreground font-mono">
                    {window.location.origin}/shared-report/{shareToken.token}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <CheckCheck size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Expires on {formatDate(shareToken.expiresAt)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateShareLink}
                  loading={generating}
                  className="w-full"
                >
                  Regenerate Link
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleGenerateShareLink}
                loading={generating}
                className="w-full gap-2"
              >
                <Share2 size={15} /> Generate Share Link
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="text-xs text-muted-foreground text-center">
          Reports include data from the last 30 days. Weekly summary emails are sent every Monday morning.
        </p>
      </div>
    </div>
  );
}
