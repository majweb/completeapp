import { Head, useForm, Link } from '@inertiajs/react';
import { LucidePlus, LucideTrash2, LucidePencil } from 'lucide-react';
import React, { useState } from 'react';

import { destroy as destroyAction } from '@/actions/App/Http/Controllers/TechnicianController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { index as techniciansIndex, create as techniciansCreate, edit as techniciansEdit } from '@/routes/technicians';

interface Technician {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
}

interface Props {
    technicians: Technician[];
}

export default function Index({ technicians }: Props) {
    const [technicianToDelete, setTechnicianToDelete] = useState<number | null>(null);

    const { delete: destroy, processing } = useForm();

    const confirmDelete = () => {
        if (technicianToDelete) {
            destroy(destroyAction.url({ technician: technicianToDelete }), {
                onSuccess: () => setTechnicianToDelete(null),
                onFinish: () => setTechnicianToDelete(null),
            });
        }
    };

    return (
        <>
            <Head title="Zarządzanie ekipą" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Technicy</h1>
                        <p className="text-muted-foreground">Zarządzaj dostępem dla swoich pracowników mobilnych.</p>
                    </div>
                    <Button className="cursor-pointer" asChild>
                        <Link href={techniciansCreate()}>
                            <LucidePlus className="mr-2 h-4 w-4" />
                            Dodaj technika
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista pracowników</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pracownik</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rola</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Akcje</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {technicians.map((tech) => (
                                    <TableRow key={tech.id}>
                                        <TableCell className="font-medium">{tech.name}</TableCell>
                                        <TableCell>{tech.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                tech.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {tech.role === 'manager' ? 'Manager' : 'Technik'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={tech.is_active ? 'default' : 'destructive'} className="rounded-full">
                                                {tech.is_active ? 'Aktywny' : 'Zablokowany'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                                                    <Link href={techniciansEdit({ technician: tech.id })}>
                                                        <LucidePencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setTechnicianToDelete(tech.id)} className="text-destructive cursor-pointer">
                                                    <LucideTrash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {technicians.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">
                                            Brak dodanych techników.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Dialog potwierdzenia usuwania */}
                <Dialog open={!!technicianToDelete} onOpenChange={(open) => !open && setTechnicianToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Czy na pewno chcesz usunąć tego technika?</DialogTitle>
                            <DialogDescription>
                                Ta operacja jest nieodwracalna. Technik straci dostęp do aplikacji.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Anuluj</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={confirmDelete} disabled={processing}>
                                Usuń pracownika
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Zarządzanie ekipą', href: techniciansIndex() },
    ],
};
