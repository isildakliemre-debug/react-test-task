import { useQuery } from "@tanstack/react-query";
import { RecipesListResponse, searchRecipe } from "../../shared/api/recipesApi";

type RecipeQueryParams = {
    query: string, skip:number, limit:number
}

export default function useRecipesQuery({query, skip, limit}: RecipeQueryParams){
    return useQuery<RecipesListResponse>({ queryKey: ['recipes', query, skip, limit], queryFn: ()=>searchRecipe(query, {skip, limit}) } )
}