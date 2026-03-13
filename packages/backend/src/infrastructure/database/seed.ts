import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type NodeInput = {
  name: string
  type: 'FOLDER' | 'FILE'
  children?: NodeInput[]
}

const sampleData: NodeInput[] = [
  {
    name: 'Documents',
    type: 'FOLDER',
    children: [
      {
        name: 'Work',
        type: 'FOLDER',
        children: [
          { name: 'Projects', type: 'FOLDER', children: [
            { name: 'Project Alpha', type: 'FOLDER', children: [
              { name: 'requirements.docx', type: 'FILE' },
              { name: 'design.pdf', type: 'FILE' },
            ]},
            { name: 'Project Beta', type: 'FOLDER', children: [
              { name: 'notes.txt', type: 'FILE' },
            ]},
          ]},
          { name: 'Reports', type: 'FOLDER', children: [
            { name: 'Q1-2024.xlsx', type: 'FILE' },
            { name: 'Q2-2024.xlsx', type: 'FILE' },
          ]},
        ],
      },
      {
        name: 'Personal',
        type: 'FOLDER',
        children: [
          { name: 'Travel', type: 'FOLDER', children: [
            { name: 'Bali 2024', type: 'FOLDER', children: [
              { name: 'itinerary.pdf', type: 'FILE' },
            ]},
          ]},
          { name: 'budget.xlsx', type: 'FILE' },
        ],
      },
    ],
  },
  {
    name: 'Pictures',
    type: 'FOLDER',
    children: [
      { name: 'Wallpapers', type: 'FOLDER', children: [
        { name: 'mountain.jpg', type: 'FILE' },
        { name: 'ocean.jpg', type: 'FILE' },
      ]},
      { name: 'Screenshots', type: 'FOLDER', children: [
        { name: 'screen-001.png', type: 'FILE' },
      ]},
    ],
  },
  {
    name: 'Downloads',
    type: 'FOLDER',
    children: [
      { name: 'Software', type: 'FOLDER', children: [
        { name: 'vscode.exe', type: 'FILE' },
        { name: 'nodejs.msi', type: 'FILE' },
      ]},
      { name: 'readme.txt', type: 'FILE' },
    ],
  },
]

async function seedNode(
  node: NodeInput,
  parentId: string | null = null,
  parentPath: string = '',
  depth: number = 0,
  sortOrder: number = 0
): Promise<void> {
  const path = `${parentPath}/${node.name}`

  const created = await prisma.node.create({
    data: {
      name: node.name,
      type: node.type,
      parentId,
      path,
      depth,
      sortOrder,
    },
  })

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      await seedNode(node.children[i], created.id, path, depth + 1, i)
    }
  }
}

async function main() {
  console.log('🌱 Starting seed...')
  await prisma.node.deleteMany()
  console.log('🗑️  Cleared existing data')

  for (let i = 0; i < sampleData.length; i++) {
    await seedNode(sampleData[i], null, '', 0, i)
    console.log(`✅ Seeded: ${sampleData[i].name}`)
  }

  const count = await prisma.node.count()
  console.log(`\n🎉 Seed complete! Created ${count} nodes.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())