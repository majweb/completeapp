import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LucidePlus, LucideTrash2, LucideEdit, LucideCopy, LucideChevronDown, LucideChevronRight, LucideSearch, LucideX } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { index, create, edit, destroy, importMethod } from '@/actions/App/Http/Controllers/JobTemplateController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Template {
    id: number;
    name: string;
    description: string;
    version: string;
    structure: any[];
    category?: string;
    company_id?: number | null;
    original_id?: number | null;
}

interface IndexProps {
    myTemplates: Template[];
    globalTemplates: Record<string, Template[]>;
}

export default function Index({ myTemplates, globalTemplates }: IndexProps) {
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
    const [templateToImport, setTemplateToImport] = useState<Template | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(Object.keys(globalTemplates));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { auth } = usePage().props as any;
    const isDemo = auth.user.is_demo;

    const { delete: destroyTemplate, post: importTemplate, processing } = useForm();

    const categories = useMemo(() => Object.keys(globalTemplates), [globalTemplates]);

    const filteredGlobalTemplates = useMemo(() => {
        const filtered: Record<string, Template[]> = {};

        Object.entries(globalTemplates).forEach(([category, templates]) => {
            if (selectedCategory && category !== selectedCategory) {
                return;
            }

            const matches = templates.filter(t =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (matches.length > 0) {
                filtered[category] = matches;
            }
        });

        return filtered;
    }, [globalTemplates, searchQuery, selectedCategory]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const confirmDelete = () => {
        if (templateToDelete) {
            destroyTemplate(destroy.url(templateToDelete), {
                onSuccess: () => setTemplateToDelete(null),
                onFinish: () => setTemplateToDelete(null),
            });
        }
    };

    const confirmImport = () => {
        if (templateToImport) {
            importTemplate(importMethod.url(templateToImport.id), {
                onSuccess: () => setTemplateToImport(null),
                onFinish: () => setTemplateToImport(null),
            });
        }
    };

    return (
        <>
            <Head title="Szablony zleceń" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Szablony zleceń</h1>
                    {!isDemo && (
                        <Button asChild className="w-full cursor-pointer sm:w-auto">
                            <Link href={create.url()}>
                                <LucidePlus className="mr-2 h-4 w-4" />
                                Dodaj własny szablon
                            </Link>
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="my-templates" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="my-templates" className="cursor-pointer">Moje szablony</TabsTrigger>
                        <TabsTrigger value="catalog" className="cursor-pointer">Katalog branżowy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-templates" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Twoje szablony</CardTitle>
                                <CardDescription>Szablony specyficzne dla Twojej firmy, które możesz edytować.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6">
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50 font-medium">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Nazwa</th>
                                                <th className="px-4 py-3 text-left">Opis</th>
                                                <th className="px-4 py-3 text-left">Wersja</th>
                                                <th className="px-4 py-3 text-left">Pola</th>
                                                <th className="px-4 py-3 text-right">Akcje</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {myTemplates.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-muted-foreground py-8">
                                                        Brak własnych szablonów. Zaimportuj gotowy wzorzec z katalogu branżowego.
                                                    </td>
                                                </tr>
                                            ) : (
                                                myTemplates.map((template) => (
                                                    <tr key={template.id} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium">{template.name}</td>
                                                        <td className="px-4 py-3 max-w-xs truncate">{template.description}</td>
                                                        <td className="px-4 py-3">{template.version}</td>
                                                        <td className="px-4 py-3">{template.structure.length} pól</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="outline" size="icon" asChild title="Edytuj">
                                                                    <Link href={edit.url(template.id)}>
                                                                        <LucideEdit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button variant="outline" size="icon" className="text-destructive" onClick={() => setTemplateToDelete(template.id)} title="Usuń">
                                                                    <LucideTrash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile view for My Templates */}
                                <div className="divide-y sm:hidden">
                                    {myTemplates.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8 px-4">
                                            Brak własnych szablonów. Zaimportuj gotowy wzorzec z katalogu branżowego.
                                        </div>
                                    ) : (
                                        myTemplates.map((template) => (
                                            <div key={template.id} className="p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold leading-none">{template.name}</h3>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 italic">{template.description}</p>
                                                    </div>
                                                    <Badge variant="outline" className="shrink-0">v{template.version}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">{template.structure.length} pól</span>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={edit.url(template.id)}>
                                                                <LucideEdit className="mr-2 h-3.5 w-3.5" />
                                                                Edytuj
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => setTemplateToDelete(template.id)}>
                                                            <LucideTrash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="catalog" className="mt-4 space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Szukaj w katalogu (np. elektryka, klimatyzacja...)"
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground"
                                    >
                                        <LucideX className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide sm:pb-0">
                                <Button
                                    variant={selectedCategory === null ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(null)}
                                    className="cursor-pointer shrink-0"
                                >
                                    Wszystkie
                                </Button>
                                {categories.map(category => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(filteredGlobalTemplates).length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                                    <p className="text-muted-foreground">Nie znaleziono szablonów pasujących do Twoich kryteriów.</p>
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory(null);
                                        }}
                                    >
                                        Wyczyść filtry
                                    </Button>
                                </div>
                            ) : (
                                Object.entries(filteredGlobalTemplates).map(([category, templates]) => (
                                    <div key={category} className="border rounded-lg overflow-hidden bg-card shadow-sm">
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {expandedCategories.includes(category) ? <LucideChevronDown className="h-5 w-5" /> : <LucideChevronRight className="h-5 w-5" />}
                                                <h3 className="font-semibold text-lg">{category}</h3>
                                                <Badge variant="secondary">{templates.length}</Badge>
                                            </div>
                                        </button>

                                        {expandedCategories.includes(category) && (
                                            <div className="p-4 pt-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {templates.map((template) => (
                                                    <Card key={template.id} className="flex flex-col hover:shadow-md transition-shadow">
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-base">{template.name}</CardTitle>
                                                            <CardDescription className="line-clamp-2 min-h-[40px]">{template.description}</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="flex-1 pb-4">
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <Badge variant="outline" className="font-normal">Wersja {template.version}</Badge>
                                                                <span>Liczba pól: {template.structure.length}</span>
                                                            </div>
                                                        </CardContent>
                                                        <div className="p-4 pt-0 mt-auto border-t">
                                                            {myTemplates.some(mt => mt.original_id === template.id) ? (
                                                                <div className="mt-4 p-2 bg-muted text-muted-foreground text-center rounded text-sm font-medium">
                                                                    Już zaimportowano
                                                                </div>
                                                            ) : !isDemo ? (
                                                                <Button
                                                                    variant="secondary"
                                                                    className="w-full mt-4 cursor-pointer"
                                                                    onClick={() => setTemplateToImport(template)}
                                                                >
                                                                    <LucideCopy className="mr-2 h-4 w-4" />
                                                                    Importuj do firmy
                                                                </Button>
                                                            ) : null}
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <Dialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Czy na pewno chcesz usunąć ten szablon?</DialogTitle>
                            <DialogDescription>
                                Ta operacja jest nieodwracalna. Szablon zostanie trwale usunięty z Twojej firmy.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Anuluj</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={confirmDelete} disabled={processing}>
                                Usuń szablon
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!templateToImport} onOpenChange={(open) => !open && setTemplateToImport(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Importuj szablon</DialogTitle>
                            <DialogDescription>
                                Czy chcesz dodać szablon <span className="font-bold text-foreground">"{templateToImport?.name}"</span> do swojej firmy?
                                Po zaimportowaniu będziesz mógł go dowolnie edytować bez wpływania na wzorzec ogólny.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Anuluj</Button>
                            </DialogClose>
                            <Button onClick={confirmImport} disabled={processing}>
                                <LucideCopy className="mr-2 h-4 w-4" />
                                Potwierdź import
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
        { title: 'Szablony', href: index.url() },
    ],
};
