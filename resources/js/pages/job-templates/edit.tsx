import { Head, Link, useForm } from '@inertiajs/react';
import { LucideArrowLeft, LucidePlus, LucideSave, LucideTrash2, LucideCheckSquare, LucideType, LucideHash, LucideLayout, LucideListChecks, LucideSettings } from 'lucide-react';

import { index, update } from '@/actions/App/Http/Controllers/JobTemplateController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceInput } from '@/components/voice-input';
import { JobTemplatePreview } from './preview';

interface Field {
    id: string;
    label: string;
    type: 'checkbox' | 'text' | 'number';
    required: boolean;
}

interface Template {
    id: number;
    name: string;
    description: string;
    version: string;
    structure: Field[];
    require_photo_before: boolean;
    require_photo_after: boolean;
    require_signature: boolean;
}

export default function Edit({ template }: { template: Template }) {
    const { data, setData, put, processing, errors } = useForm({
        name: template.name,
        description: template.description || '',
        version: template.version,
        structure: template.structure,
        require_photo_before: template.require_photo_before,
        require_photo_after: template.require_photo_after,
        require_signature: template.require_signature,
    });

    const addField = () => {
        setData('structure', [
            ...data.structure,
            { id: `field_${data.structure.length + 1}`, label: '', type: 'checkbox', required: false }
        ]);
    };

    const removeField = (index: number) => {
        const newStructure = [...data.structure];
        newStructure.splice(index, 1);
        setData('structure', newStructure);
    };

    const updateField = (index: number, key: keyof Field, value: any) => {
        const newStructure = [...data.structure];
        newStructure[index] = { ...newStructure[index], [key]: value };
        setData('structure', newStructure);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url(template.id));
    };

    return (
        <>
            <Head title={`Edytuj szablon: ${template.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="cursor-pointer">
                            <Link href={index.url()}>
                                <LucideArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edytuj szablon</h1>
                            <p className="text-muted-foreground">{template.name} - v{template.version}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <form onSubmit={submit} className="space-y-8 lg:col-span-7">
                        {/* Sekcja 1: Podstawowe informacje */}
                        <Card className="shadow-sm border-muted-foreground/10">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <LucideLayout className="h-5 w-5" />
                                    <CardTitle>Podstawowe informacje</CardTitle>
                                </div>
                                <CardDescription>Główne parametry rozpoznawcze szablonu.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold">Nazwa szablonu</Label>
                                        <div className="relative group">
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="pr-10 focus-visible:ring-primary h-10 transition-all"
                                            />
                                            <VoiceInput
                                                onResult={(text) => setData('name', text)}
                                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="version" className="text-sm font-semibold">Wersja</Label>
                                        <Input
                                            id="version"
                                            value={data.version}
                                            onChange={(e) => setData('version', e.target.value)}
                                            className="h-10 transition-all"
                                        />
                                        <InputError message={errors.version} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-semibold">Opis (opcjonalnie)</Label>
                                    <div className="relative group">
                                        <Input
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="pr-10 h-10 transition-all"
                                        />
                                        <VoiceInput
                                            onResult={(text) => setData('description', text)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2"
                                        />
                                    </div>
                                    <InputError message={errors.description} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sekcja 2: Projektant checklisty */}
                        <Card className="shadow-sm border-muted-foreground/10">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <div>
                                    <div className="flex items-center gap-2 text-primary">
                                        <LucideListChecks className="h-5 w-5" />
                                        <CardTitle>Projektant checklisty</CardTitle>
                                    </div>
                                    <CardDescription>Zdefiniuj kroki, które musi wykonać pracownik.</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addField} className="cursor-pointer border-primary/20 text-primary hover:bg-primary/5">
                                    <LucidePlus className="mr-2 h-4 w-4" />
                                    Dodaj pole
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    {data.structure.map((field, index) => (
                                        <div key={index} className="group relative flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/30 md:flex-row md:items-center">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                    Etykieta pola {index + 1}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        value={field.label}
                                                        onChange={(e) => updateField(index, 'label', e.target.value)}
                                                        className="pr-10 h-10 border-muted group-hover:border-primary/20 transition-all"
                                                    />
                                                    <VoiceInput
                                                        onResult={(text) => updateField(index, 'label', text)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 items-end md:flex md:items-center md:gap-4">
                                                <div className="space-y-2 md:w-48">
                                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Typ danych</Label>
                                                    <Select
                                                        value={field.type}
                                                        onValueChange={(value: any) => updateField(index, 'type', value)}
                                                    >
                                                        <SelectTrigger className="h-10">
                                                            <div className="flex items-center gap-2">
                                                                {field.type === 'checkbox' && <LucideCheckSquare className="h-4 w-4 text-primary" />}
                                                                {field.type === 'text' && <LucideType className="h-4 w-4 text-blue-500" />}
                                                                {field.type === 'number' && <LucideHash className="h-4 w-4 text-orange-500" />}
                                                                <SelectValue />
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="checkbox" className="cursor-pointer">
                                                                <div className="flex items-center gap-2">
                                                                    <LucideCheckSquare className="h-4 w-4 text-primary" />
                                                                    <span>Checkbox</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="text" className="cursor-pointer">
                                                                <div className="flex items-center gap-2">
                                                                    <LucideType className="h-4 w-4 text-blue-500" />
                                                                    <span>Tekst</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="number" className="cursor-pointer">
                                                                <div className="flex items-center gap-2">
                                                                    <LucideHash className="h-4 w-4 text-orange-500" />
                                                                    <span>Liczba</span>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center gap-2 pb-2.5 px-2 md:pb-0 md:pt-6">
                                                    <Checkbox
                                                        id={`req-${index}`}
                                                        checked={field.required}
                                                        onCheckedChange={(checked) => updateField(index, 'required', !!checked)}
                                                        className="h-5 w-5"
                                                    />
                                                    <Label htmlFor={`req-${index}`} className="text-sm font-medium cursor-pointer whitespace-nowrap">Wymagane</Label>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer absolute -right-2 -top-2 rounded-full border bg-background shadow-sm h-8 w-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeField(index)}
                                                disabled={data.structure.length === 1}
                                            >
                                                <LucideTrash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.structure} />
                            </CardContent>
                        </Card>

                        {/* Sekcja 3: Ustawienia workflow */}
                        <Card className="shadow-sm border-muted-foreground/10">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <LucideSettings className="h-5 w-5" />
                                    <CardTitle>Wymagania końcowe (Workflow)</CardTitle>
                                </div>
                                <CardDescription>Dodatkowe czynności wymagane do zamknięcia zlecenia.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-slate-50/50 hover:bg-white transition-colors">
                                        <Checkbox
                                            id="req_photo_before"
                                            checked={data.require_photo_before}
                                            onCheckedChange={(checked) => setData('require_photo_before', !!checked)}
                                            className="h-5 w-5"
                                        />
                                        <Label htmlFor="req_photo_before" className="font-medium cursor-pointer leading-tight">Zdjęcie przed rozpoczęciem</Label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-slate-50/50 hover:bg-white transition-colors">
                                        <Checkbox
                                            id="req_photo_after"
                                            checked={data.require_photo_after}
                                            onCheckedChange={(checked) => setData('require_photo_after', !!checked)}
                                            className="h-5 w-5"
                                        />
                                        <Label htmlFor="req_photo_after" className="font-medium cursor-pointer leading-tight">Zdjęcie po zakończeniu</Label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-slate-50/50 hover:bg-white transition-colors">
                                        <Checkbox
                                            id="req_signature"
                                            checked={data.require_signature}
                                            onCheckedChange={(checked) => setData('require_signature', !!checked)}
                                            className="h-5 w-5"
                                        />
                                        <Label htmlFor="req_signature" className="font-medium cursor-pointer leading-tight">Podpis klienta przy odbiorze</Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <InputError message={errors.require_photo_before} />
                                    <InputError message={errors.require_photo_after} />
                                    <InputError message={errors.require_signature} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" asChild disabled={processing} className="px-8 cursor-pointer">
                                <Link href={index.url()}>Anuluj</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="px-8 shadow-lg shadow-primary/20 cursor-pointer">
                                <LucideSave className="mr-2 h-4 w-4" />
                                Zapisz zmiany
                            </Button>
                        </div>
                    </form>

                    <div className="hidden lg:block lg:col-span-5">
                        <div className="sticky top-8 space-y-4">
                            <JobTemplatePreview data={data as any} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Szablony', href: index.url() },
        { title: 'Edytuj', href: '#' },
    ],
};
