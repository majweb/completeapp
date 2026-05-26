import { Head, router } from '@inertiajs/react';
import _ from 'lodash';
const { pickBy } = _;
import { Building, LogIn, Search, User, UserCheck, UserMinus, X } from 'lucide-react';
import { useState } from 'react';
import * as ReactUse from 'react-use';
const { useDebounce } = ReactUse;

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { impersonate, users as adminUsers } from '@/routes/admin';
import { toggleStatus } from '@/routes/admin/users';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    company?: {
        name: string;
    };
}

interface Props {
    users: {
        data: UserData[];
        links: any[];
    };
    filters: {
        search?: string;
        role?: string;
    };
}

export default function Users({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const handleImpersonate = (userId: number) => {
        router.post(impersonate(userId).url);
    };

    const confirmToggleStatus = (user: UserData) => {
        setSelectedUser(user);
        setStatusConfirmOpen(true);
    };

    const handleToggleStatus = () => {
        if (!selectedUser) {
            return;
        }

        router.post(toggleStatus(selectedUser.id).url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setStatusConfirmOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRole('all');
    };

    useDebounce(
        () => {
            const data = pickBy({ search: search, role: role }, (value) => {
                return value !== '' && value !== 'all';
            });

            router.get(adminUsers(), data, {
                preserveState: true,
                replace: true,
            });
        },
        300,
        [search, role],
    );

    const roleTranslations: Record<string, string> = {
        admin: 'Administrator',
        owner: 'Właściciel',
        manager: 'Menedżer',
        technician: 'Technik',
    };

    return (
        <>
            <Head title="Lista użytkowników - Admin" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Wszyscy użytkownicy</h1>
                        <p className="text-muted-foreground">Podgląd wszystkich użytkowników w systemie.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Szukaj po nazwie, emailu lub firmie..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtruj po roli" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Wszystkie role</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="owner">Właściciel</SelectItem>
                                <SelectItem value="manager">Menedżer</SelectItem>
                                <SelectItem value="technician">Technik</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {(search !== '' || role !== 'all') && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="h-9 px-3 lg:px-4"
                        >
                            Wyczyść
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Lista użytkowników
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Użytkownik</TableHead>
                                    <TableHead>Rola</TableHead>
                                    <TableHead>Firma</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Akcje</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                                {roleTranslations[user.role] || user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Building className="w-3 h-3 text-muted-foreground" />
                                                {user.company?.name || 'Brak'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? 'success' : 'outline'}>
                                                {user.is_active ? 'Aktywny' : 'Nieaktywny'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.id !== (users as any).auth?.user?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => confirmToggleStatus(user)}
                                                        title={user.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                                                        className={user.is_active ? 'text-destructive' : 'text-green-600'}
                                                    >
                                                        {user.is_active ? (
                                                            <UserMinus className="w-4 h-4" />
                                                        ) : (
                                                            <UserCheck className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleImpersonate(user.id)}
                                                        className="gap-1"
                                                    >
                                                        <LogIn className="w-3 h-3" />
                                                        Zaloguj jako
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Zmień status użytkownika</DialogTitle>
                        <DialogDescription>
                            Czy na pewno chcesz {selectedUser?.is_active ? 'dezaktywować' : 'aktywować'} użytkownika{' '}
                            <strong>{selectedUser?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusConfirmOpen(false)}>
                            Anuluj
                        </Button>
                        <Button
                            variant={selectedUser?.is_active ? 'destructive' : 'default'}
                            onClick={handleToggleStatus}
                        >
                            {selectedUser?.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
