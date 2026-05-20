import { Head, Link, useForm } from '@inertiajs/react';
import { LucideArrowLeft, LucidePlus, LucideSave, LucideTrash2 } from 'lucide-react';

import { index, store } from '@/actions/App/Http/Controllers/JobTemplateController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceInput } from '@/components/voice-input';

interface Field {
    id: string;
    label: string;
    type: 'checkbox' | 'text' | 'number';
    required: boolean;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        description: string;
        version: string;
        structure: Field[];
    }>({
        name: '',
        description: '',
        version: '1.0',
        structure: [
            { id: 'field_1', label: '', type: 'checkbox', required: false }
        ],
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
        post(store.url());
    };

    return (
        <>
            <Head title="Utwórz szablon" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="cursor-pointer">
                        <Link href={index.url()}>
                            <LucideArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Utwórz nowy szablon</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Podstawowe informacje</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nazwa szablonu</Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="np. Przegląd klimatyzacji"
                                            className="pr-10"
                                        />
                                        <VoiceInput
                                            onResult={(text) => setData('name', text)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="version">Wersja</Label>
                                    <Input
                                        id="version"
                                        value={data.version}
                                        onChange={(e) => setData('version', e.target.value)}
                                        placeholder="1.0"
                                    />
                                    <InputError message={errors.version} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Opis (opcjonalnie)</Label>
                                <div className="relative">
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Krótki opis przeznaczenia szablonu"
                                        className="pr-10"
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Struktura checklisty</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addField} className="cursor-pointer">
                                <LucidePlus className="mr-2 h-4 w-4" />
                                Dodaj pole
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.structure.map((field, index) => (
                                <div key={index} className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label>Etykieta pola</Label>
                                        <div className="relative">
                                            <Input
                                                value={field.label}
                                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                                placeholder="np. Sprawdzenie ciśnienia"
                                                className="pr-10"
                                            />
                                            <VoiceInput
                                                onResult={(text) => updateField(index, 'label', text)}
                                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2 md:w-40">
                                        <Label>Typ pola</Label>
                                        <Select
                                            value={field.type}
                                            onValueChange={(value: any) => updateField(index, 'type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                                <SelectItem value="text">Tekst</SelectItem>
                                                <SelectItem value="number">Liczba</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2 pb-2">
                                        <Checkbox
                                            id={`req-${index}`}
                                            checked={field.required}
                                            onCheckedChange={(checked) => updateField(index, 'required', !!checked)}
                                        />
                                        <Label htmlFor={`req-${index}`}>Wymagane</Label>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive cursor-pointer"
                                        onClick={() => removeField(index)}
                                        disabled={data.structure.length === 1}
                                    >
                                        <LucideTrash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <InputError message={errors.structure} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild disabled={processing} className="cursor-pointer">
                            <Link href={index.url()}>Anuluj</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="cursor-pointer">
                            <LucideSave className="mr-2 h-4 w-4" />
                            Zapisz szablon
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Szablony', href: index.url() },
        { title: 'Dodaj', href: '#' },
    ],
};
