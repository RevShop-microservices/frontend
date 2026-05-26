import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { BrowserRouter } from "react-router-dom"
import Register from "./Register"

describe("Register Page Tests", () => {

   test("Create Account button should exist", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const button = screen.getByText("Create Account")

      expect(button).toBeInTheDocument()

   })

   test("Name input should exist", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const nameInput = screen.getByPlaceholderText("John Doe")

      expect(nameInput).toBeInTheDocument()

   })

   test("Email input should exist", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const emailInput = screen.getByPlaceholderText("you@example.com")

      expect(emailInput).toBeInTheDocument()

   })

   test("Password input should exist", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const passwordInput = screen.getByPlaceholderText("••••••••")

      expect(passwordInput).toBeInTheDocument()

   })

   test("User can type in Name input", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const nameInput = screen.getByPlaceholderText("John Doe")

      fireEvent.change(nameInput, {
         target: { value: "Janani" }
      })

      expect(nameInput.value).toBe("Janani")

   })

   test("User can type in Email input", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const emailInput = screen.getByPlaceholderText("you@example.com")

      fireEvent.change(emailInput, {
         target: { value: "Janani@gmail.com" }
      })

      expect(emailInput.value).toBe("Janani@gmail.com")

   })

   test("User can type in Password input", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const passwordInput = screen.getByPlaceholderText("••••••••")

      fireEvent.change(passwordInput, {
         target: { value: "password123" }
      })

      expect(passwordInput.value).toBe("password123")

   })

   test("Password visibility toggle should work", () => {

      render(
         <BrowserRouter>
            <Register />
         </BrowserRouter>
      )

      const passwordInput = screen.getByPlaceholderText("••••••••")

      expect(passwordInput.type).toBe("password")

      const toggleButton = screen.getAllByRole("button")[0]

      fireEvent.click(toggleButton)

      expect(passwordInput.type).toBe("text")

   })

})