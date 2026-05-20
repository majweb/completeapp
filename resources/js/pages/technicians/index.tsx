import { Head, useForm } from '@inertiajs/react';
import { LucidePlus, LucideTrash2, LucidePencil, LucideUser, LucideMail, LucideLock, LucideShieldCheck } from 'lucide-react';
import React, { useState } from 'react';

import { store, update, destroy as destroyAction } from '@/actions/App/Http/Controllers/TechnicianController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { index as techniciansIndex } from '@/routes/technicians';

interface Technician {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    technicians: Technician[];
}

export default function Index({ technicians }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
    const [technicianToDelete, setTechnicianToDelete] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'technician',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTechnician) {
            put(update.url({ technician: editingTechnician.id }), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditingTechnician(null);
                    reset();
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                },
            });
        }
    };

    const editTechnician = (tech: Technician) => {
        setEditingTechnician(tech);

        setData({
            name: tech.name,
            email: tech.email,
            password: '',
            role: tech.role,
        });
        setIsCreateOpen(true);
    };

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
                    <Dialog open={isCreateOpen} onOpenChange={(open) => {
                        setIsCreateOpen(open);

                        if (!open) {
                            setEditingTechnician(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer">
                                <LucidePlus className="mr-2 h-4 w-4" />
                                Dodaj technika
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingTechnician ? 'Edytuj technika' : 'Dodaj nowego technika'}</DialogTitle>
                                <DialogDescription>
                                    Wprowadź dane dostępowe dla pracownika. Technik będzie mógł logować się do aplikacji mobilnej.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Imię i nazwisko</Label>
                                    <div className="relative">
                                        <LucideUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="pl-10"
                                            placeholder="np. Jan Kowalski"
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <LucideMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="pl-10"
                                            placeholder="jan@firma.pl"
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">{editingTechnician ? 'Nowe hasło (opcjonalnie)' : 'Hasło'}</Label>
                                    <div className="relative">
                                        <LucideLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10"
                                            placeholder="min. 8 znaków"
                                        />
                                    </div>
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rola</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger className="w-full">
                                            <div className="flex items-center gap-2">
                                                <LucideShieldCheck className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Wybierz rolę" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technician">Technik (User mobilny)</SelectItem>
                                            <SelectItem value="manager">Manager (Dostęp webowy)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {editingTechnician ? 'Zapisz zmiany' : 'Dodaj technika'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => editTechnician(tech)} className="cursor-pointer">
                                                    <LucidePencil className="h-4 w-4" />
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
