const VARIANTS = {
  default: 'border-gray-200',
  outlined: 'border-gray-300',
  elevated: 'border-transparent',
} as const

type Variant = keyof typeof VARIANTS

const PADDINGS = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
} as const

type Padding = keyof typeof PADDINGS

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: Variant
  padding?: Padding
  shadow?: boolean
  hover?: boolean
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = true,
  hover = false,
  className = '',
  ...props
}: CardProps) => {
  const baseStyles = 'bg-white rounded-lg border'

  const shadowStyles = shadow ? 'shadow-md' : ''
  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5'
    : ''

  return (
    <div
      className={`${baseStyles} ${VARIANTS[variant]} ${PADDINGS[padding]} ${shadowStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Card subcomponents for better composition
interface CardSubcomponentPropsFromDiv extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardSubcomponentPropsFromH3 extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

interface CardSubcomponentPropsFromP extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

Card.Header = ({
  children,
  className = '',
  ...props
}: CardSubcomponentPropsFromDiv) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
)

Card.Title = ({
  children,
  className = '',
  ...props
}: CardSubcomponentPropsFromH3) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
)

Card.Description = ({
  children,
  className = '',
  ...props
}: CardSubcomponentPropsFromP) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
)

Card.Content = ({
  children,
  className = '',
  ...props
}: CardSubcomponentPropsFromDiv) => (
  <div className={`text-gray-700 ${className}`} {...props}>
    {children}
  </div>
)

Card.Footer = ({
  children,
  className = '',
  ...props
}: CardSubcomponentPropsFromDiv) => (
  <div className={`mt-4 flex gap-2 ${className}`} {...props}>
    {children}
  </div>
)
