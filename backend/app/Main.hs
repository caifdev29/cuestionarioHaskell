{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}

import Data.Aeson (FromJSON, ToJSON)
import Data.List (sortBy)
import qualified Data.Map as Map
import Data.Ord (Down (..), comparing)
import Data.Text (Text)
import GHC.Generics (Generic)
import Network.Wai (Middleware)
import Network.Wai.Middleware.Cors
import Web.Scotty

-- 1. Modelo de datos JSON
data GeneroPuntaje = GeneroPuntaje
  { genero :: Text,
    puntuacion :: Int
  }
  deriving (Show, Generic)

instance ToJSON GeneroPuntaje
instance FromJSON GeneroPuntaje

-- 2. Configuración del CORS
configCors :: Middleware
configCors = cors (const $ Just policy)
  where
    policy =
      simpleCorsResourcePolicy
        { corsOrigins = Nothing,
          corsMethods = ["GET", "POST", "OPTIONS"],
          corsRequestHeaders = ["Content-Type"]
        }

-- 3. Lógica para procesar el arreglo ordenado
procesarRanking :: Map.Map Text Int -> [GeneroPuntaje]
procesarRanking mapa =
  let lista = Map.toList mapa
      -- Se ordenan los géneros por mayor puntaje a menor
      ordenados = sortBy (comparing (Down . snd)) lista
   in map (\(g, p) -> GeneroPuntaje g p) ordenados

-- Configuración del servidor
main :: IO ()
main = scotty 3000 $ do
  middleware configCors

  post "/top-genres" $ do
    -- Recibe el objeto JSON
    datos <- jsonData :: ActionM (Map.Map Text Int)

    let resultado = procesarRanking datos

    -- Retorna el arreglo ordenado
    json resultado

  get "/" $ text "Servidor activo en el puerto 3000"