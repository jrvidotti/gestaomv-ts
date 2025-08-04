'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UserCheck,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Users,
  DollarSign,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

// Mock data para demonstração
const mockCustomers = [
  {
    id: 1,
    name: 'Empresa ABC Ltda',
    email: 'contato@empresaabc.com',
    phone: '(11) 99999-9999',
    segment: 'Tecnologia',
    status: 'active',
    lastContact: '2024-01-15',
    totalValue: 125000,
  },
  {
    id: 2,
    name: 'Indústria XYZ S.A.',
    email: 'vendas@industriaxyz.com',
    phone: '(11) 88888-8888',
    segment: 'Industrial',
    status: 'prospect',
    lastContact: '2024-01-20',
    totalValue: 85000,
  },
  {
    id: 3,
    name: 'Comércio 123 ME',
    email: 'admin@comercio123.com',
    phone: '(11) 77777-7777',
    segment: 'Varejo',
    status: 'active',
    lastContact: '2024-02-01',
    totalValue: 45000,
  },
  {
    id: 4,
    name: 'Serviços DEF Eireli',
    email: 'info@servicosdef.com',
    phone: '(11) 66666-6666',
    segment: 'Serviços',
    status: 'inactive',
    lastContact: '2023-12-15',
    totalValue: 0,
  },
];

const statusLabels = {
  active: 'Ativo',
  prospect: 'Prospect',
  inactive: 'Inativo',
};

const statusColors = {
  active: 'default',
  prospect: 'secondary',
  inactive: 'destructive',
} as const;

export default function CustomersPage() {
  const [customers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.segment.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeCustomers = customers.filter((c) => c.status === 'active');
  const prospects = customers.filter((c) => c.status === 'prospect');
  const totalValue = customers.reduce((sum, c) => sum + c.totalValue, 0);

  const header = (
    <PageHeader
      title="Clientes"
      subtitle="Gerencie relacionamentos e informações dos clientes"
      actions={[
        <Button key="novo-cliente">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <CardStats titulo="Total de Clientes" valor={customers.length} icone={Users} />

            <CardStats
              titulo="Clientes Ativos"
              valor={activeCustomers.length}
              icone={UserCheck}
              corValor="text-2xl font-bold text-green-600"
            />

            <CardStats
              titulo="Prospects"
              valor={prospects.length}
              icone={UserCheck}
              corValor="text-2xl font-bold text-blue-600"
            />

            <CardStats
              titulo="Valor Total"
              valor={totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              icone={DollarSign}
            />
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Visualize e gerencie todos os clientes do CRM</CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Contato</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${customer.email}`} />
                            <AvatarFallback>
                              {customer.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.segment}</TableCell>
                      <TableCell>{customer.status}</TableCell>
                      <TableCell>{new Date(customer.lastContact).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {customer.totalValue.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Ligar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
