// ============================================
// INTEGRATION TESTS - CategoryFilter component
// ============================================
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Category } from "@/types";

describe("CategoryFilter", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it("renders all 6 categories", () => {
    render(<CategoryFilter selected={[]} onToggle={mockOnToggle} />);
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
  });

  it("highlights selected categories with blue bg", () => {
    render(<CategoryFilter selected={["technology"]} onToggle={mockOnToggle} />);
    const techBtn = screen.getByText("Technology").closest("button");
    expect(techBtn).toHaveClass("bg-blue-600");
  });

  it("does NOT highlight unselected categories", () => {
    render(<CategoryFilter selected={[]} onToggle={mockOnToggle} />);
    const techBtn = screen.getByText("Technology").closest("button");
    expect(techBtn).not.toHaveClass("bg-blue-600");
  });

  it("calls onToggle with correct category when clicked", () => {
    render(<CategoryFilter selected={[]} onToggle={mockOnToggle} />);
    fireEvent.click(screen.getByText("Sports"));
    expect(mockOnToggle).toHaveBeenCalledWith("sports" as Category);
  });

  it("calls onToggle once per click", () => {
    render(<CategoryFilter selected={[]} onToggle={mockOnToggle} />);
    fireEvent.click(screen.getByText("Finance"));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
