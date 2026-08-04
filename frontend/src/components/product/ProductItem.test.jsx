import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductItem from "./ProductItem";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProductItem", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("uses the landscape treatment only for property listings and navigates on card click", () => {
    const propertyProduct = {
      _id: "property-1",
      name: "Luxury Villa",
      price: 250000,
      images: [{ url: "/images/property.jpg" }],
      listingType: "property",
      propertyDetails: {
        location: "Beverly Hills",
        propertyType: "Villa",
      },
    };

    const retailProduct = {
      _id: "retail-1",
      name: "Running Shoes",
      price: 120,
      images: [{ url: "/images/shoe.jpg" }],
      ratings: 4.5,
      numOfReviews: 12,
      listingType: "product",
    };

    const { rerender } = render(
      <MemoryRouter>
        <ProductItem product={propertyProduct} columnSize={4} />
      </MemoryRouter>
    );

    const propertyCard = screen.getByTestId("product-card");
    expect(propertyCard.className).toContain("property-card");
    expect(propertyCard.className).toContain("property-card--landscape");

    rerender(
      <MemoryRouter>
        <ProductItem product={retailProduct} columnSize={4} />
      </MemoryRouter>
    );

    const retailCard = screen.getByTestId("product-card");
    expect(retailCard.className).toContain("product-card");
    expect(retailCard.className).not.toContain("property-card");
    expect(retailCard.className).not.toContain("property-card--landscape");

    fireEvent.click(retailCard);
    expect(mockNavigate).toHaveBeenCalledWith("/product/retail-1");
  });
});
