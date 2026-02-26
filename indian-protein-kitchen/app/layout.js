import './globals.css'

export const metadata = {
  title: 'Indian Protein Kitchen | Premium Fitness Nutrition',
  description: 'Discover authentic Indian high-protein recipes tailored to your fitness goals. Calculate macros, plan meals, and shop smarter.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
