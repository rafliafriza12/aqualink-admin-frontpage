import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock Material-UI components that might cause issues in tests
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  
  // Reset localStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  // Reset sessionStorage
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
  
  // Reset fetch
  fetch.mockClear()
})

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    id: '1',
    username: 'admin',
    email: 'admin@pdam-tirtadaroy.ac.id',
    role: 'administrator',
    permissions: [],
    isActive: true,
    sessionTimeout: 30,
    maxConcurrentSessions: 2,
  },
  
  // Mock customer data
  mockCustomer: {
    id: '1',
    nik: '1101010101010001',
    name: 'Ahmad Rizki',
    email: 'ahmad.rizki@email.com',
    phone: '081234567890',
    address: 'Jl. Teuku Umar No. 123, Banda Aceh',
    customerType: 'rumah_tangga',
    accountStatus: 'active',
    registrationDate: new Date('2023-01-15'),
    location: {
      latitude: 5.5483,
      longitude: 95.3238,
      address: 'Jl. Teuku Umar No. 123, Banda Aceh',
    },
  },
  
  // Mock work order data
  mockWorkOrder: {
    id: '1',
    type: 'installation',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Teknisi A',
    customerId: '1',
    description: 'Instalasi meteran baru',
    location: {
      address: 'Jl. Teuku Umar No. 123, Banda Aceh',
      coordinates: {
        latitude: 5.5483,
        longitude: 95.3238,
      },
    },
    scheduledDate: new Date('2024-01-20T09:00:00'),
    estimatedDuration: 120,
  },
  
  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),
  
  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
}
