import os

base = 'frontend/app'
pages = [
    '(public)/page.tsx',
    '(public)/events/page.tsx',
    '(public)/events/[id]/page.tsx',
    '(public)/categories/page.tsx',
    '(public)/calendar/page.tsx',
    '(public)/about/page.tsx',
    '(public)/contact/page.tsx',
    
    'auth/login/page.tsx',
    'auth/register/page.tsx',
    'auth/forgot-password/page.tsx',
    'auth/reset-password/page.tsx',
    
    'student/layout.tsx',
    'student/dashboard/page.tsx',
    'student/registrations/page.tsx',
    'student/favorites/page.tsx',
    'student/certificates/page.tsx',
    'student/notifications/page.tsx',
    'student/profile/page.tsx',
    
    'organizer/layout.tsx',
    'organizer/dashboard/page.tsx',
    'organizer/events/page.tsx',
    'organizer/events/create/page.tsx',
    'organizer/events/[id]/page.tsx',
    'organizer/events/[id]/edit/page.tsx',
    'organizer/events/[id]/registrations/page.tsx',
    'organizer/events/[id]/attendance/page.tsx',
    'organizer/events/[id]/certificates/page.tsx',
    'organizer/events/[id]/analytics/page.tsx',
    'organizer/announcements/page.tsx',
    'organizer/profile/page.tsx',
    
    'admin/layout.tsx',
    'admin/dashboard/page.tsx',
    'admin/users/page.tsx',
    'admin/events/page.tsx',
    'admin/venues/page.tsx',
    'admin/categories/page.tsx',
    'admin/certificates/page.tsx',
    'admin/notifications/page.tsx',
    'admin/settings/page.tsx',
    
    'verify/certificate/page.tsx'
]

for p in pages:
    path = os.path.join(base, p)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    name = os.path.basename(os.path.dirname(path)).title()
    name = name.replace('-', '').replace('[', '').replace(']', '').replace('(', '').replace(')', '')
    if name == 'Public': name = 'Home'
    if not name or name == 'Id': name = 'Details'
    
    content = f'''export default function {name}Page() {{
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{name} Page</h1>
    </div>
  )
}}
'''
    if path.endswith('layout.tsx'):
        content = f'''export default function Layout({{ children }}: {{ children: React.ReactNode }}) {{
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-muted/20 p-4">Sidebar</aside>
      <main className="flex-1 overflow-y-auto">{{children}}</main>
    </div>
  )
}}
'''
    with open(path, 'w') as f:
        f.write(content)
