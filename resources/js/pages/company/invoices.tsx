import { Head, Link } from '@inertiajs/react';
import { LucideFileText, LucideDownload, LucideArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invoice {
    id: string;
    total: string;
    date: string;
    status: string;
}

interface Props {
    invoices: Invoice[];
}

export default function Invoices({ invoices }: Props) {
    return (
        <>
            <Head title="Faktury" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/subscription">
                                <LucideArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Twoje Faktury</h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Historia płatności</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoices.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kwota</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Akcja</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle">{invoice.date}</td>
                                                <td className="p-4 align-middle font-medium">{invoice.total}</td>
                                                <td className="p-4 align-middle capitalize">{invoice.status}</td>
                                                <td className="p-4 align-middle text-right">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={`/subscription/invoices/${invoice.id}`} target="_blank" rel="noopener noreferrer">
                                                            <LucideDownload className="mr-2 h-4 w-4" />
                                                            Pobierz PDF
                                                        </a>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <LucideFileText className="mb-2 h-10 w-10 opacity-20" />
                                <p>Nie znaleziono żadnych faktur.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Invoices.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Subskrypcja', href: '/subscription' },
        { title: 'Faktury', href: '/subscription/invoices' },
    ],
};
